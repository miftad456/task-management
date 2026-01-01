import request from 'supertest';
import { createServer } from '../server.js';
import { createTestUser, createTestTask, createTestManager, generateTestToken } from './helpers.js';
import { TeamModel } from '../infrastructure/model/team_model.js';
import { TaskModel } from '../infrastructure/model/task_model.js';

const app = createServer();

describe('Comment API Endpoints', () => {
    describe('POST /comments/task/:taskId', () => {
        it('should add a comment to a task', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const response = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'This is a test comment' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.content).toBe('This is a test comment');
            expect(response.body.data.taskId).toBe(task._id.toString());
            expect(response.body.data.userId).toBe(user._id.toString());
        });

        it('should fail if content is missing', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const response = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({})
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /comments/task/:taskId', () => {
        it('should get all comments for a task', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            // Add two comments
            await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Comment 1' });

            await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Comment 2' });

            const response = await request(app)
                .get(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
            expect(response.body.data[0].content).toBe('Comment 2'); // Newest first
        });
    });

    describe('DELETE /comments/:id', () => {
        it('should delete own comment', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const createResponse = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'To be deleted' });

            const commentId = createResponse.body.data.id;

            const deleteResponse = await request(app)
                .delete(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(deleteResponse.body.success).toBe(true);
        });

        it('should fail to delete someone else\'s comment', async () => {
            const user1 = await createTestUser();
            const user2 = await createTestUser();
            const { accessToken: token1 } = generateTestToken(user1);
            const { accessToken: token2 } = generateTestToken(user2);
            const task = await createTestTask(user1._id);

            const createResponse = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${token1}`)
                .send({ content: 'User 1 comment' });

            const commentId = createResponse.body.data.id;

            const deleteResponse = await request(app)
                .delete(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(403);

            expect(deleteResponse.body.success).toBe(false);
            expect(deleteResponse.body.message).toContain('Unauthorized');
        });
    });

    describe('PUT /comments/:id', () => {
        it('should update own comment', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const createResponse = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Original comment' });

            const commentId = createResponse.body.data.id;

            const updateResponse = await request(app)
                .put(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Updated comment' })
                .expect(200);

            expect(updateResponse.body.success).toBe(true);
            expect(updateResponse.body.data.content).toBe('Updated comment');
            expect(updateResponse.body.data.id).toBe(commentId);
        });

        it('should fail to update someone else\'s comment', async () => {
            const user1 = await createTestUser();
            const user2 = await createTestUser();
            const { accessToken: token1 } = generateTestToken(user1);
            const { accessToken: token2 } = generateTestToken(user2);
            const task = await createTestTask(user1._id);

            const createResponse = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${token1}`)
                .send({ content: 'User 1 comment' });

            const commentId = createResponse.body.data.id;

            const updateResponse = await request(app)
                .put(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${token2}`)
                .send({ content: 'Trying to update' })
                .expect(403);

            expect(updateResponse.body.success).toBe(false);
            expect(updateResponse.body.message).toContain('Unauthorized');
        });

        it('should fail with empty content', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const createResponse = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Original comment' });

            const commentId = createResponse.body.data.id;

            const updateResponse = await request(app)
                .put(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: '' })
                .expect(400);

            expect(updateResponse.body.success).toBe(false);
        });

        it('should fail with content exceeding 1000 characters', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const createResponse = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Original comment' });

            const commentId = createResponse.body.data.id;
            const longContent = 'a'.repeat(1001);

            const updateResponse = await request(app)
                .put(`/comments/${commentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: longContent })
                .expect(400);

            expect(updateResponse.body.success).toBe(false);
        });
    });

    describe('Comment User Info', () => {
        it('should include user info (username and name) in comment response', async () => {
            const user = await createTestUser({ username: 'testuser', name: 'Test User' });
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const response = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Comment with user info' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.username).toBe('testuser');
            expect(response.body.data.user.name).toBe('Test User');
            expect(response.body.data.user.id).toBe(user._id.toString());
        });

        it('should include user info when fetching comments', async () => {
            const user = await createTestUser({ username: 'commenter', name: 'Comment User' });
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Test comment' });

            const response = await request(app)
                .get(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
            expect(response.body.data[0].user).toBeDefined();
            expect(response.body.data[0].user.username).toBe('commenter');
            expect(response.body.data[0].user.name).toBe('Comment User');
        });
    });

    describe('Team-Based Access Control', () => {
        let manager, member1, member2, nonMember;
        let managerToken, member1Token, member2Token, nonMemberToken;
        let teamId, teamTaskId, personalTaskId;

        beforeEach(async () => {
            manager = await createTestManager({ username: 'manager', email: 'manager@test.com' });
            member1 = await createTestUser({ username: 'member1', email: 'member1@test.com' });
            member2 = await createTestUser({ username: 'member2', email: 'member2@test.com' });
            nonMember = await createTestUser({ username: 'nonmember', email: 'nonmember@test.com' });

            managerToken = generateTestToken(manager).accessToken;
            member1Token = generateTestToken(member1).accessToken;
            member2Token = generateTestToken(member2).accessToken;
            nonMemberToken = generateTestToken(nonMember).accessToken;

            // Create team
            const team = await TeamModel.create({
                name: 'Test Team',
                managerId: manager._id.toString(),
                members: [member1._id.toString(), member2._id.toString()],
            });
            teamId = team._id.toString();

            // Create team task
            const teamTask = await TaskModel.create({
                title: 'Team Task',
                description: 'Team task description',
                userId: member1._id.toString(),
                assignedBy: manager._id.toString(),
                teamId: teamId,
            });
            teamTaskId = teamTask._id.toString();

            // Create personal task
            const personalTask = await TaskModel.create({
                title: 'Personal Task',
                description: 'Personal task description',
                userId: member1._id.toString(),
            });
            personalTaskId = personalTask._id.toString();
        });

        describe('Personal Task Comments', () => {
            it('should allow task owner to comment on personal task', async () => {
                const response = await request(app)
                    .post(`/comments/task/${personalTaskId}`)
                    .set('Authorization', `Bearer ${member1Token}`)
                    .send({ content: 'Owner comment' })
                    .expect(200);

                expect(response.body.success).toBe(true);
            });

            it('should deny non-owner from commenting on personal task', async () => {
                const response = await request(app)
                    .post(`/comments/task/${personalTaskId}`)
                    .set('Authorization', `Bearer ${member2Token}`)
                    .send({ content: 'Trying to comment' })
                    .expect(403);

                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('Access denied');
            });

            it('should allow task owner to view comments on personal task', async () => {
                await request(app)
                    .post(`/comments/task/${personalTaskId}`)
                    .set('Authorization', `Bearer ${member1Token}`)
                    .send({ content: 'Owner comment' });

                const response = await request(app)
                    .get(`/comments/task/${personalTaskId}`)
                    .set('Authorization', `Bearer ${member1Token}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
            });

            it('should deny non-owner from viewing comments on personal task', async () => {
                await request(app)
                    .post(`/comments/task/${personalTaskId}`)
                    .set('Authorization', `Bearer ${member1Token}`)
                    .send({ content: 'Owner comment' });

                const response = await request(app)
                    .get(`/comments/task/${personalTaskId}`)
                    .set('Authorization', `Bearer ${member2Token}`)
                    .expect(403);

                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('Access denied');
            });
        });

        describe('Team Task Comments', () => {
            it('should allow manager to comment on team task', async () => {
                const response = await request(app)
                    .post(`/comments/task/${teamTaskId}`)
                    .set('Authorization', `Bearer ${managerToken}`)
                    .send({ content: 'Manager comment' })
                    .expect(200);

                expect(response.body.success).toBe(true);
            });

            it('should allow team member to comment on team task', async () => {
                const response = await request(app)
                    .post(`/comments/task/${teamTaskId}`)
                    .set('Authorization', `Bearer ${member1Token}`)
                    .send({ content: 'Member comment' })
                    .expect(200);

                expect(response.body.success).toBe(true);
            });

            it('should deny non-member from commenting on team task', async () => {
                const response = await request(app)
                    .post(`/comments/task/${teamTaskId}`)
                    .set('Authorization', `Bearer ${nonMemberToken}`)
                    .send({ content: 'Trying to comment' })
                    .expect(403);

                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('Access denied');
            });

            it('should allow team members to view all comments on team task', async () => {
                // Manager adds comment
                await request(app)
                    .post(`/comments/task/${teamTaskId}`)
                    .set('Authorization', `Bearer ${managerToken}`)
                    .send({ content: 'Manager comment' });

                // Member1 adds comment
                await request(app)
                    .post(`/comments/task/${teamTaskId}`)
                    .set('Authorization', `Bearer ${member1Token}`)
                    .send({ content: 'Member1 comment' });

                // Member2 views comments
                const response = await request(app)
                    .get(`/comments/task/${teamTaskId}`)
                    .set('Authorization', `Bearer ${member2Token}`)
                    .expect(200);

                expect(response.body.success).toBe(true);
                expect(response.body.data.length).toBe(2);
            });

            it('should deny non-member from viewing comments on team task', async () => {
                await request(app)
                    .post(`/comments/task/${teamTaskId}`)
                    .set('Authorization', `Bearer ${member1Token}`)
                    .send({ content: 'Member comment' });

                const response = await request(app)
                    .get(`/comments/task/${teamTaskId}`)
                    .set('Authorization', `Bearer ${nonMemberToken}`)
                    .expect(403);

                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('Access denied');
            });
        });
    });

    describe('Comment Count in Tasks', () => {
        it('should include comment count when fetching a task', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            // Add comments
            await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Comment 1' });

            await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: 'Comment 2' });

            const response = await request(app)
                .get(`/tasks/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.commentCount).toBe(2);
        });

        it('should show zero comment count for task with no comments', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const response = await request(app)
                .get(`/tasks/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.commentCount).toBe(0);
        });
    });

    describe('Comment Validation', () => {
        it('should fail with empty content', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const response = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: '' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail with content exceeding 1000 characters', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);
            const longContent = 'a'.repeat(1001);

            const response = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: longContent })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should accept content with exactly 1000 characters', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);
            const maxContent = 'a'.repeat(1000);

            const response = await request(app)
                .post(`/comments/task/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ content: maxContent })
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });
});
