import request from "supertest";
import { createServer } from "../server.js";
import { UserModel } from "../infrastructure/model/user_model.js";
import { TeamModel } from "../infrastructure/model/team_model.js";
import { TaskModel } from "../infrastructure/model/task_model.js";
import { createTestUser, createTestManager, generateTestToken } from "./helpers.js";

const app = createServer();

let managerToken, member1Token, member2Token, nonMemberToken;
let managerId, member1Id, member2Id, nonMemberId;
let teamId;

beforeEach(async () => {
    // Create users using helpers
    const manager = await createTestManager({ username: "manager", email: "manager@test.com" });
    managerId = manager._id.toString();
    managerToken = generateTestToken(manager).accessToken;

    const member1 = await createTestUser({ username: "member1", email: "member1@test.com" });
    member1Id = member1._id.toString();
    member1Token = generateTestToken(member1).accessToken;

    const member2 = await createTestUser({ username: "member2", email: "member2@test.com" });
    member2Id = member2._id.toString();
    member2Token = generateTestToken(member2).accessToken;

    const nonMember = await createTestUser({ username: "nonmember", email: "nonmember@test.com" });
    nonMemberId = nonMember._id.toString();
    nonMemberToken = generateTestToken(nonMember).accessToken;

    // Create team with manager and members
    const team = await TeamModel.create({
        name: "Test Team",
        managerId: managerId,
        members: [member1Id, member2Id],
    });
    teamId = team._id.toString();
});

describe("Team Task Visibility - GET /tasks/team/:teamId/tasks", () => {
    test("Manager can view all team tasks", async () => {
        // Manager assigns tasks to both members
        await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Task for Member 1",
                description: "Test task",
                userId: member1Id,
                teamId: teamId,
            });

        await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Task for Member 2",
                description: "Test task",
                userId: member2Id,
                teamId: teamId,
            });

        // Manager fetches all team tasks
        const res = await request(app)
            .get(`/tasks/team/${teamId}/tasks`)
            .set("Authorization", `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data.map(t => t.title)).toContain("Task for Member 1");
        expect(res.body.data.map(t => t.title)).toContain("Task for Member 2");
    });

    test("Team member can view all team tasks", async () => {
        // Manager assigns task
        await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Task for Member 1",
                userId: member1Id,
                teamId: teamId,
            });

        // Member 1 tries to fetch all team tasks
        const res = await request(app)
            .get(`/tasks/team/${teamId}/tasks`)
            .set("Authorization", `Bearer ${member1Token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
    });

    test("Non-team-member cannot view team tasks (403)", async () => {
        const res = await request(app)
            .get(`/tasks/team/${teamId}/tasks`)
            .set("Authorization", `Bearer ${nonMemberToken}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
    });

    test("Returns empty array when team has no tasks", async () => {
        const res = await request(app)
            .get(`/tasks/team/${teamId}/tasks`)
            .set("Authorization", `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
    });
});

describe("Team Task Visibility - GET /tasks/team/:teamId/tasks/member/:userId", () => {
    test("Team member can view another member's tasks (read-only)", async () => {
        // Manager assigns task to member 2
        await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Task for Member 2",
                description: "Test task",
                userId: member2Id,
                teamId: teamId,
            });

        // Member 1 views Member 2's tasks
        const res = await request(app)
            .get(`/tasks/team/${teamId}/tasks/member/${member2Id}`)
            .set("Authorization", `Bearer ${member1Token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].title).toBe("Task for Member 2");
        expect(res.body.data[0].userId).toBe(member2Id);
    });

    test("Manager can view specific member's tasks", async () => {
        await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Task for Member 1",
                userId: member1Id,
                teamId: teamId,
            });

        const res = await request(app)
            .get(`/tasks/team/${teamId}/tasks/member/${member1Id}`)
            .set("Authorization", `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].title).toBe("Task for Member 1");
    });

    test("Non-team-member cannot view member tasks (403)", async () => {
        const res = await request(app)
            .get(`/tasks/team/${teamId}/tasks/member/${member1Id}`)
            .set("Authorization", `Bearer ${nonMemberToken}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("Access denied");
    });

    test("Cannot view tasks of user not in team (400)", async () => {
        const res = await request(app)
            .get(`/tasks/team/${teamId}/tasks/member/${nonMemberId}`)
            .set("Authorization", `Bearer ${member1Token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("not a member");
    });

    test("Returns empty array when member has no tasks", async () => {
        const res = await request(app)
            .get(`/tasks/team/${teamId}/tasks/member/${member1Id}`)
            .set("Authorization", `Bearer ${member2Token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
    });
});

describe("Team Task Visibility - GET /tasks/team/:teamId/my-tasks", () => {
    test("Team member can view own tasks in team context", async () => {
        // Manager assigns tasks to member 1
        await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "My Team Task 1",
                userId: member1Id,
                teamId: teamId,
            });

        await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "My Team Task 2",
                userId: member1Id,
                teamId: teamId,
            });

        // Member 1 fetches own team tasks
        const res = await request(app)
            .get(`/tasks/team/${teamId}/my-tasks`)
            .set("Authorization", `Bearer ${member1Token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data.every(t => t.userId === member1Id)).toBe(true);
        expect(res.body.data.every(t => t.teamId === teamId)).toBe(true);
    });

    test("Manager can view own tasks in team context", async () => {
        // Create task for manager
        await TaskModel.create({
            title: "Manager's Task",
            userId: managerId,
            teamId: teamId,
            assignedBy: managerId,
        });

        const res = await request(app)
            .get(`/tasks/team/${teamId}/my-tasks`)
            .set("Authorization", `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0].title).toBe("Manager's Task");
    });

    test("Non-team-member cannot view team tasks (403)", async () => {
        const res = await request(app)
            .get(`/tasks/team/${teamId}/my-tasks`)
            .set("Authorization", `Bearer ${nonMemberToken}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("not a member");
    });

    test("Returns empty array when user has no tasks in team", async () => {
        const res = await request(app)
            .get(`/tasks/team/${teamId}/my-tasks`)
            .set("Authorization", `Bearer ${member1Token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(0);
    });
});

describe("Task Assignment with teamId", () => {
    test("Assigned tasks include teamId", async () => {
        const assignRes = await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Task with Team",
                description: "Test",
                userId: member1Id,
                teamId: teamId,
            });

        expect(assignRes.status).toBe(200);
        expect(assignRes.body.data.teamId).toBe(teamId);
        expect(assignRes.body.data.assignedBy).toBe(managerId);
    });

    test("Self-created tasks have null teamId", async () => {
        const res = await request(app)
            .post("/tasks/create")
            .set("Authorization", `Bearer ${member1Token}`)
            .send({
                title: "Personal Task",
                description: "My own task",
            });

        expect(res.status).toBe(200);
        expect(res.body.data.teamId).toBeNull();
        expect(res.body.data.assignedBy).toBeNull();
    });
});

describe("Read-Only Enforcement", () => {
    let taskId;

    beforeEach(async () => {
        // Manager assigns task to member 1
        const assignRes = await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Task for Member 1",
                userId: member1Id,
                teamId: teamId,
            });

        taskId = assignRes.body.data.id;
    });

    test("Task owner can update their own task", async () => {
        const res = await request(app)
            .put(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${member1Token}`)
            .send({
                title: "Updated Task Title",
                description: "Updated",
            });

        expect(res.status).toBe(200);
        expect(res.body.data.title).toBe("Updated Task Title");
    });

    test("Other team member cannot update task (400)", async () => {
        const res = await request(app)
            .put(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${member2Token}`)
            .send({
                title: "Trying to update",
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("Not allowed");
    });

    test("Other team member cannot delete task (400)", async () => {
        const res = await request(app)
            .delete(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${member2Token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    test("Manager cannot update member's task directly", async () => {
        const res = await request(app)
            .put(`/tasks/${taskId}`)
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Manager trying to update",
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain("Not allowed");
    });
});

describe("Backward Compatibility", () => {
    test("Existing tasks without teamId still work", async () => {
        // Create task without teamId (old behavior)
        const task = await TaskModel.create({
            title: "Legacy Task",
            description: "No team",
            userId: member1Id,
            status: "pending",
        });

        // Fetch task
        const res = await request(app)
            .get(`/tasks/${task._id}`)
            .set("Authorization", `Bearer ${member1Token}`);

        expect(res.status).toBe(200);
        expect(res.body.data.teamId).toBeNull();
    });

    test("User can still fetch all their tasks (with and without teamId)", async () => {
        // Create task with teamId
        await request(app)
            .post("/tasks/assign")
            .set("Authorization", `Bearer ${managerToken}`)
            .send({
                title: "Team Task",
                userId: member1Id,
                teamId: teamId,
            });

        // Create task without teamId
        await request(app)
            .post("/tasks/create")
            .set("Authorization", `Bearer ${member1Token}`)
            .send({
                title: "Personal Task",
            });

        const res = await request(app)
            .get("/tasks/fetch")
            .set("Authorization", `Bearer ${member1Token}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
    });
});
