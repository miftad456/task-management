import request from 'supertest';
import { createServer } from '../server.js';
import { createTestUser, createTestManager, createTestTeam, generateTestToken } from './helpers.js';

const app = createServer();

describe('Team API Endpoints', () => {
    describe('POST /teams', () => {
        it('should create a team successfully', async () => {
            const manager = await createTestManager();
            const { accessToken } = generateTestToken(manager);

            const response = await request(app)
                .post('/teams')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ name: 'Engineering Team' })
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Team created');
            expect(response.body.data.name).toBe('Engineering Team');
            expect(response.body.data.managerId).toBe(manager._id.toString());
            expect(response.body.data.id).toBeDefined();
        });

        it('should fail to create team without authentication', async () => {
            const response = await request(app)
                .post('/teams')
                .send({ name: 'Test Team' })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /teams/:teamId/member', () => {
        it('should add member to team by username', async () => {
            const manager = await createTestManager();
            const member = await createTestUser({ username: 'newmember' });
            const { accessToken } = generateTestToken(manager);
            const team = await createTestTeam(manager._id);

            const response = await request(app)
                .post(`/teams/${team.id}/member`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ username: 'newmember' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Member added');
            expect(response.body.data.username).toBe('newmember');
            expect(response.body.data.team.members).toContain(member._id.toString());
        });

        it('should add member to team by userId', async () => {
            const manager = await createTestManager();
            const member = await createTestUser();
            const { accessToken } = generateTestToken(manager);
            const team = await createTestTeam(manager._id);

            const response = await request(app)
                .post(`/teams/${team.id}/member`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ userId: member._id.toString() })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.team.members).toContain(member._id.toString());
        });

        it('should fail to add member if not manager', async () => {
            const manager = await createTestManager();
            const notManager = await createTestUser();
            const member = await createTestUser({ username: 'newmember' });
            const { accessToken } = generateTestToken(notManager);
            const team = await createTestTeam(manager._id);

            const response = await request(app)
                .post(`/teams/${team.id}/member`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ username: 'newmember' })
                .expect(403);

            expect(response.body.success).toBe(false);
        });

        it('should fail to add non-existent user', async () => {
            const manager = await createTestManager();
            const { accessToken } = generateTestToken(manager);
            const team = await createTestTeam(manager._id);

            const response = await request(app)
                .post(`/teams/${team.id}/member`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ username: 'nonexistentuser' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /teams/:teamId/member', () => {
        it('should remove member from team', async () => {
            const manager = await createTestManager();
            const member = await createTestUser({ username: 'removeme' });
            const { accessToken } = generateTestToken(manager);
            const team = await createTestTeam(manager._id, { members: [member._id] });

            const response = await request(app)
                .delete(`/teams/${team.id}/member`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ username: 'removeme' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Member removed');
            expect(response.body.data.username).toBe('removeme');
            expect(response.body.data.team.members).not.toContain(member._id.toString());
        });

        it('should fail to remove member if not manager', async () => {
            const manager = await createTestManager();
            const notManager = await createTestUser();
            const member = await createTestUser({ username: 'somemember' });
            const { accessToken } = generateTestToken(notManager);
            const team = await createTestTeam(manager._id, { members: [member._id] });

            const response = await request(app)
                .delete(`/teams/${team.id}/member`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ username: 'somemember' })
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /teams/:teamId', () => {
        it('should get team by ID as manager', async () => {
            const manager = await createTestManager();
            const { accessToken } = generateTestToken(manager);
            const team = await createTestTeam(manager._id, { name: 'My Team' });

            const response = await request(app)
                .get(`/teams/${team.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('My Team');
            expect(response.body.data.managerId).toBe(manager._id.toString());
        });

        it('should get team by ID as member', async () => {
            const manager = await createTestManager();
            const member = await createTestUser();
            const { accessToken } = generateTestToken(member);
            const team = await createTestTeam(manager._id, { members: [member._id] });

            const response = await request(app)
                .get(`/teams/${team.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.members).toContain(member._id.toString());
        });

        it('should fail to get team if not manager or member', async () => {
            const manager = await createTestManager();
            const outsider = await createTestUser();
            const { accessToken } = generateTestToken(outsider);
            const team = await createTestTeam(manager._id);

            const response = await request(app)
                .get(`/teams/${team.id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /teams/by-name/:name', () => {
        it('should get team by name as manager', async () => {
            const manager = await createTestManager();
            const { accessToken } = generateTestToken(manager);
            await createTestTeam(manager._id, { name: 'UniqueTeamName' });

            const response = await request(app)
                .get('/teams/by-name/UniqueTeamName')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('UniqueTeamName');
        });

        it('should fail to get team by name if not manager role', async () => {
            const manager = await createTestManager();
            const regularUser = await createTestUser();
            const { accessToken } = generateTestToken(regularUser);
            await createTestTeam(manager._id, { name: 'SomeTeam' });

            const response = await request(app)
                .get('/teams/by-name/SomeTeam')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /teams/manager/all', () => {
        it('should get all teams managed by user', async () => {
            const manager = await createTestManager();
            const { accessToken } = generateTestToken(manager);

            await createTestTeam(manager._id, { name: 'Team 1' });
            await createTestTeam(manager._id, { name: 'Team 2' });
            await createTestTeam(manager._id, { name: 'Team 3' });

            const response = await request(app)
                .get('/teams/manager/all')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(3);
        });

        it('should fail if user is not a manager', async () => {
            const regularUser = await createTestUser();
            const { accessToken } = generateTestToken(regularUser);

            const response = await request(app)
                .get('/teams/manager/all')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /teams/member/all', () => {
        it('should get all teams where user is a member', async () => {
            const manager = await createTestManager();
            const member = await createTestUser();
            const { accessToken } = generateTestToken(member);

            await createTestTeam(manager._id, { name: 'Team A', members: [member._id] });
            await createTestTeam(manager._id, { name: 'Team B', members: [member._id] });

            const response = await request(app)
                .get('/teams/member/all')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('DELETE /teams/:teamId/leave', () => {
        it('should request to leave team as member', async () => {
            const manager = await createTestManager();
            const member = await createTestUser();
            const { accessToken } = generateTestToken(member);
            const team = await createTestTeam(manager._id, { members: [member._id] });

            const response = await request(app)
                .delete(`/teams/${team.id}/leave`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Leave request submitted');
            expect(response.body.data).toHaveProperty('teamId');
            expect(response.body.data).toHaveProperty('userId');
            expect(response.body.data.status).toBe('pending');
        });

        it('should fail to request leave if not a member', async () => {
            const manager = await createTestManager();
            const notMember = await createTestUser();
            const { accessToken } = generateTestToken(notMember);
            const team = await createTestTeam(manager._id);

            const response = await request(app)
                .delete(`/teams/${team.id}/leave`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /teams/:teamId/leave-requests', () => {
        it('should get pending leave requests as manager', async () => {
            const manager = await createTestManager();
            const member = await createTestUser();
            const { accessToken: managerToken } = generateTestToken(manager);
            const { accessToken: memberToken } = generateTestToken(member);
            const team = await createTestTeam(manager._id, { members: [member._id] });

            // Member requests to leave
            await request(app)
                .delete(`/teams/${team.id}/leave`)
                .set('Authorization', `Bearer ${memberToken}`);

            // Manager gets leave requests
            const response = await request(app)
                .get(`/teams/${team.id}/leave-requests`)
                .set('Authorization', `Bearer ${managerToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            expect(response.body.data[0].status).toBe('pending');
        });

        it('should fail to get leave requests if not manager', async () => {
            const manager = await createTestManager();
            const notManager = await createTestUser();
            const { accessToken } = generateTestToken(notManager);
            const team = await createTestTeam(manager._id);

            const response = await request(app)
                .get(`/teams/${team.id}/leave-requests`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /teams/:teamId/leave-request/:requestId/approve', () => {
        it('should approve leave request as manager', async () => {
            const manager = await createTestManager();
            const member = await createTestUser();
            const { accessToken: managerToken } = generateTestToken(manager);
            const { accessToken: memberToken } = generateTestToken(member);
            const team = await createTestTeam(manager._id, { members: [member._id] });

            // Member requests to leave
            const leaveResponse = await request(app)
                .delete(`/teams/${team.id}/leave`)
                .set('Authorization', `Bearer ${memberToken}`);

            const requestId = leaveResponse.body.data.id || leaveResponse.body.data._id;

            // Manager approves
            const response = await request(app)
                .put(`/teams/${team.id}/leave-request/${requestId}/approve`)
                .set('Authorization', `Bearer ${managerToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Leave request approved');
            expect(response.body.data.status).toBe('approved');
        });
    });

    describe('PUT /teams/:teamId/leave-request/:requestId/reject', () => {
        it('should reject leave request as manager', async () => {
            const manager = await createTestManager();
            const member = await createTestUser();
            const { accessToken: managerToken } = generateTestToken(manager);
            const { accessToken: memberToken } = generateTestToken(member);
            const team = await createTestTeam(manager._id, { members: [member._id] });

            // Member requests to leave
            const leaveResponse = await request(app)
                .delete(`/teams/${team.id}/leave`)
                .set('Authorization', `Bearer ${memberToken}`);

            const requestId = leaveResponse.body.data.id || leaveResponse.body.data._id;

            // Manager rejects
            const response = await request(app)
                .put(`/teams/${team.id}/leave-request/${requestId}/reject`)
                .set('Authorization', `Bearer ${managerToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Leave request rejected');
            expect(response.body.data.status).toBe('rejected');
        });
    });
});
