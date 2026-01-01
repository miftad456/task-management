import request from "supertest";
import { createServer } from "../server.js";
import {
    createTestUser,
    createTestTask,
    createTestTeam,
    generateTestToken,
} from "./helpers.js";

const app = createServer();

describe("Dashboard API", () => {

    describe("GET /dashboard", () => {
        it("should return user dashboard stats", async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            await createTestTask(user._id, { status: "completed" });
            await createTestTask(user._id, { status: "pending" });

            const response = await request(app)
                .get("/dashboard")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.totalTasks).toBe(2);
            expect(response.body.data.completedTasks).toBe(1);
            expect(response.body.data.pendingTasks).toBe(1);
        });

        it("should fail without authentication", async () => {
            const response = await request(app)
                .get("/dashboard")
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /dashboard/team/:teamId", () => {
        it("should allow team manager to view team dashboard", async () => {
            const manager = await createTestUser();
            const team = await createTestTeam(manager._id);

            const { accessToken } = generateTestToken(manager);

            const response = await request(app)
                .get(`/dashboard/team/${team.id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("totalTasks");
        });

        it("should deny access for non-manager", async () => {
            const manager = await createTestUser();
            const member = await createTestUser({ username: "member1" });

            const team = await createTestTeam(manager._id, [member._id]);
            const { accessToken } = generateTestToken(member);

            const response = await request(app)
                .get(`/dashboard/team/${team.id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

});
