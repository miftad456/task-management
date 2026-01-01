import request from 'supertest';
import { createServer } from '../server.js';
import { createTestUser, createTestTask, generateTestToken, createTestTeam } from './helpers.js';

const app = createServer();

describe('Task Assignment and Submission API', () => {
    let manager, member, team, managerToken, memberToken;

    beforeEach(async () => {
        const m = await createTestUser({ role: 'manager' });
        manager = { ...m, id: m.id || m._id.toString() };

        const mem = await createTestUser();
        member = { ...mem, id: mem.id || mem._id.toString() };

        team = await createTestTeam(manager.id, { members: [member.id] });

        const mTokens = generateTestToken(manager);
        managerToken = mTokens.accessToken;

        const memTokens = generateTestToken(member);
        memberToken = memTokens.accessToken;
    });

    describe('POST /tasks/assign', () => {
        it('should allow a manager to assign a task to a team member', async () => {
            const response = await request(app)
                .post('/tasks/assign')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    title: 'Assigned Task',
                    userId: member.id,
                    teamId: team.id,
                    deadline: new Date(Date.now() + 86400000)
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.assignedBy).toBe(manager.id);
            expect(response.body.data.userId).toBe(member.id);
        });

        it('should fail if requester is not the manager of the team', async () => {
            const otherManager = await createTestUser({ role: 'manager' });
            const { accessToken: otherToken } = generateTestToken(otherManager);

            const response = await request(app)
                .post('/tasks/assign')
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    title: 'Illegal Task',
                    userId: member.id,
                    teamId: team.id
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Only the team manager');
        });
    });

    describe('Submission Workflow', () => {
        let assignedTask;

        beforeEach(async () => {
            const response = await request(app)
                .post('/tasks/assign')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    title: 'Task to Submit',
                    userId: member.id,
                    teamId: team.id
                });

            if (!response.body.success) {
                throw new Error(`Assignment failed in nested beforeEach: ${response.body.message}`);
            }
            assignedTask = response.body.data;
        });

        it('should allow a member to submit an assigned task', async () => {
            const response = await request(app)
                .post(`/submissions/task/${assignedTask.id}`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ note: 'I am done!' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('submitted');
        });

        it('should allow a manager to approve a submitted task', async () => {
            // 1. Submit
            await request(app)
                .post(`/submissions/task/${assignedTask.id}`)
                .set('Authorization', `Bearer ${memberToken}`)
                .expect(200);

            // 2. Approve
            const response = await request(app)
                .put(`/submissions/task/${assignedTask.id}/review`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({ action: 'approve' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('completed');
        });

        it('should allow a manager to reject a submitted task', async () => {
            // 1. Submit
            await request(app)
                .post(`/submissions/task/${assignedTask.id}`)
                .set('Authorization', `Bearer ${memberToken}`)
                .expect(200);

            // 2. Reject
            const response = await request(app)
                .put(`/submissions/task/${assignedTask.id}/review`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({ action: 'reject' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('pending');
        });
    });

    describe('GET /tasks/assigned', () => {
        it('should allow a member to fetch tasks assigned to them', async () => {
            // 1. Manager assigns a task
            await request(app)
                .post('/tasks/assign')
                .set('Authorization', `Bearer ${managerToken}`)
                .send({
                    title: 'Assigned to Member',
                    userId: member.id,
                    teamId: team.id
                });

            // 2. Member fetches assigned tasks
            const response = await request(app)
                .get('/tasks/assigned')
                .set('Authorization', `Bearer ${memberToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].assignedBy).toBe(manager.id);
            expect(response.body.data[0].userId).toBe(member.id);
        });

        it('should not return tasks created by the user themselves', async () => {
            // 1. Member creates their own task
            await request(app)
                .post('/tasks/create')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ title: 'My Personal Task' });

            // 2. Member fetches assigned tasks
            const response = await request(app)
                .get('/tasks/assigned')
                .set('Authorization', `Bearer ${memberToken}`)
                .expect(200);

            // Should only contain the one assigned by manager, not the personal one
            const personalTask = response.body.data.find(t => t.title === 'My Personal Task');
            expect(personalTask).toBeUndefined();
        });
    });
});
