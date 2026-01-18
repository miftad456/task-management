import request from 'supertest';
import { createServer } from '../server.js';
import { createTestUser, createTestTask, generateTestToken } from './helpers.js';

const app = createServer();

describe('Task API Endpoints', () => {
    describe('POST /tasks/create', () => {
        it('should create a new task successfully', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            const taskData = {
                title: 'New Task',
                description: 'Task description',
                priority: 'high',
                status: 'pending',
                deadline: new Date(Date.now() + 86400000).toISOString(),
            };

            const response = await request(app)
                .post('/tasks/create')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(taskData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task created');
            expect(response.body.data.title).toBe('New Task');
            expect(response.body.data.priority).toBe('high');
            expect(response.body.data.userId).toBe(user._id.toString());
        });

        it('should fail to create task without authentication', async () => {
            const taskData = {
                title: 'Unauthorized Task',
                description: 'Should fail',
            };

            const response = await request(app)
                .post('/tasks/create')
                .send(taskData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should fail to create task with invalid data', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            const invalidTask = {
                // Missing required title
                description: 'No title',
            };

            const response = await request(app)
                .post('/tasks/create')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(invalidTask)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /tasks/fetch', () => {
        it('should get all tasks for authenticated user', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            // Create multiple tasks
            await createTestTask(user._id, { title: 'Task 1' });
            await createTestTask(user._id, { title: 'Task 2' });
            await createTestTask(user._id, { title: 'Task 3' });

            const response = await request(app)
                .get('/tasks/fetch')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(3);
        });

        it('should return empty array when user has no tasks', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            const response = await request(app)
                .get('/tasks/fetch')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
        });

        it('should fail to get tasks without authentication', async () => {
            const response = await request(app)
                .get('/tasks/fetch')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /tasks/:id', () => {
        it('should get task by ID for owner', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id, { title: 'My Task' });

            const response = await request(app)
                .get(`/tasks/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('My Task');
            expect(response.body.data.id).toBe(task._id.toString());
        });

        it('should fail to get task owned by another user', async () => {
            const user1 = await createTestUser();
            const user2 = await createTestUser({ username: 'otheruser' });
            const { accessToken } = generateTestToken(user2);

            const task = await createTestTask(user1._id);

            const response = await request(app)
                .get(`/tasks/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail to get non-existent task', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .get(`/tasks/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /tasks/:id', () => {
        it('should update task successfully', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const updatedData = {
                title: 'Updated Task Title',
                description: 'Updated description',
                priority: 'low',
                status: 'in-progress',
            };

            const response = await request(app)
                .put(`/tasks/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.title).toBe('Updated Task Title');
            expect(response.body.data.priority).toBe('low');
            expect(response.body.data.status).toBe('in-progress');
        });

        it('should fail to update task owned by another user', async () => {
            const user1 = await createTestUser();
            const user2 = await createTestUser({ username: 'otheruser' });
            const { accessToken } = generateTestToken(user2);

            const task = await createTestTask(user1._id);

            const response = await request(app)
                .put(`/tasks/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ title: 'Hacked' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('DELETE /tasks/:id', () => {
        it('should delete task successfully', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const response = await request(app)
                .delete(`/tasks/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Task deleted');
        });

        it('should fail to delete task owned by another user', async () => {
            const user1 = await createTestUser();
            const user2 = await createTestUser({ username: 'otheruser' });
            const { accessToken } = generateTestToken(user2);

            const task = await createTestTask(user1._id);

            const response = await request(app)
                .delete(`/tasks/${task._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PATCH /tasks/:id/status', () => {
        it('should update task status successfully', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id, { status: 'pending' });

            const response = await request(app)
                .patch(`/tasks/${task._id}/status`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ status: 'completed' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('completed');
        });
    });

    describe('PATCH /tasks/:id/priority', () => {
        it('should update task priority successfully', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id, { priority: 'medium' });

            const response = await request(app)
                .patch(`/tasks/${task._id}/priority`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ priority: 'high' })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.priority).toBe('high');
        });
    });

    describe('POST /tasks/:id/track', () => {
        it('should track time on task successfully', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id, { timeSpent: 0 });

            const response = await request(app)
                .post(`/tasks/${task._id}/track-time`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ minutes: 30 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.timeSpent).toBe(30);
        });

        it('should accumulate time tracking', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id, { timeSpent: 15 });

            const response = await request(app)
                .post(`/tasks/${task._id}/track-time`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ minutes: 45 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.timeSpent).toBe(60);
        });
    });

    describe('GET /tasks/overdue', () => {
        it('should get overdue tasks', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            // Create overdue task (deadline in the past)
            await createTestTask(user._id, {
                title: 'Overdue Task',
                deadline: new Date(Date.now() - 86400000), // Yesterday
                status: 'pending',
            });

            // Create non-overdue task
            await createTestTask(user._id, {
                title: 'Future Task',
                deadline: new Date(Date.now() + 86400000), // Tomorrow
            });

            const response = await request(app)
                .get('/tasks/overdue')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].title).toBe('Overdue Task');
        });
    });

    describe('GET /tasks/urgent', () => {
        it('should get urgent tasks based on priority and deadline', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            // Create urgent task (high priority, deadline in 30 minutes)
            await createTestTask(user._id, {
                title: 'Urgent Task',
                priority: 'high',
                deadline: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
                status: 'pending',
            });

            // Create non-urgent task
            await createTestTask(user._id, {
                title: 'Normal Task',
                priority: 'low',
                deadline: new Date(Date.now() + 86400000), // Tomorrow
            });

            const response = await request(app)
                .get('/tasks/urgent')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        });
    });
});
