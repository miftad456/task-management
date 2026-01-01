import request from 'supertest';
import { createServer } from '../server.js';
import { createTestUser, createTestTask, generateTestToken } from './helpers.js';

const app = createServer();

describe('Time Log API Endpoints', () => {
    describe('POST /tasks/:id/track', () => {
        it('should track time and create a log entry', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id, { timeSpent: 0 });

            const logData = {
                minutes: 30,
                note: 'Worked on feature X',
                startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                endTime: new Date().toISOString(),
            };

            const response = await request(app)
                .post(`/tasks/${task._id}/track`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send(logData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.timeSpent).toBe(30);

            // Verify log entry exists
            const logsResponse = await request(app)
                .get(`/tasks/${task._id}/logs`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(logsResponse.body.success).toBe(true);
            expect(logsResponse.body.data.length).toBe(1);
            expect(logsResponse.body.data[0].duration).toBe(30);
            expect(logsResponse.body.data[0].note).toBe('Worked on feature X');
            expect(logsResponse.body.data[0].userId).toBe(user._id.toString());
        });

        it('should accumulate time and multiple logs', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id, { timeSpent: 0 });

            // First log
            await request(app)
                .post(`/tasks/${task._id}/track`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ minutes: 20, note: 'Log 1' })
                .expect(200);

            // Second log
            const response = await request(app)
                .post(`/tasks/${task._id}/track`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ minutes: 40, note: 'Log 2' })
                .expect(200);

            expect(response.body.data.timeSpent).toBe(60);

            const logsResponse = await request(app)
                .get(`/tasks/${task._id}/logs`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(logsResponse.body.data.length).toBe(2);
            expect(logsResponse.body.data[0].note).toBe('Log 2'); // Sorted by newest first
            expect(logsResponse.body.data[1].note).toBe('Log 1');
        });
    });
});
