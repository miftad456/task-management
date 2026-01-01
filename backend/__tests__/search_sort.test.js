import request from 'supertest';
import { createServer } from '../server.js';
import { createTestUser, createTestTask, generateTestToken } from './helpers.js';

const app = createServer();

describe('Task Sorting and Searching API', () => {
    describe('GET /tasks/fetch (Sorting)', () => {
        it('should return tasks sorted by deadline (closest first)', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            await createTestTask(user._id, { title: 'Later Task', deadline: nextWeek });
            await createTestTask(user._id, { title: 'Sooner Task', deadline: tomorrow });
            await createTestTask(user._id, { title: 'No Deadline Task', deadline: null });

            const response = await request(app)
                .get('/tasks/fetch')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            const tasks = response.body.data;

            // Sooner Task should be first, then Later Task, then No Deadline Task
            expect(tasks[0].title).toBe('Sooner Task');
            expect(tasks[1].title).toBe('Later Task');
            expect(tasks[2].title).toBe('No Deadline Task');
        });
    });

    describe('GET /tasks/fetch (Searching)', () => {
        it('should filter tasks by title using search query', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            await createTestTask(user._id, { title: 'Apple' });
            await createTestTask(user._id, { title: 'Banana' });
            await createTestTask(user._id, { title: 'Pineapple' });

            // Search for "apple" (case-insensitive)
            const response = await request(app)
                .get('/tasks/fetch?search=apple')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            const tasks = response.body.data;
            expect(tasks.length).toBe(2); // Apple and Pineapple
            expect(tasks.map(t => t.title)).toContain('Apple');
            expect(tasks.map(t => t.title)).toContain('Pineapple');
        });

        it('should return empty array if no tasks match search', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            await createTestTask(user._id, { title: 'Task 1' });

            const response = await request(app)
                .get('/tasks/fetch?search=nonexistent')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(0);
        });
    });
});
