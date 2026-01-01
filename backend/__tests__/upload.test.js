import request from 'supertest';
import { createServer } from '../server.js';
import { createTestUser, createTestTask, generateTestToken } from './helpers.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createServer();

describe('File Upload API Endpoints', () => {
    let testFilePath;

    beforeAll(() => {
        testFilePath = path.join(__dirname, 'test-file.pdf');
        fs.writeFileSync(testFilePath, '%PDF-1.4 test content');
    });

    afterAll(() => {
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    });

    describe('POST /tasks/:id/attachments', () => {
        it('should upload a file and attach it to a task', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const response = await request(app)
                .post(`/tasks/${task._id}/attachments`)
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('file', testFilePath)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.attachments.length).toBe(1);
            expect(response.body.data.attachments[0].originalName).toBe('test-file.pdf');
            expect(response.body.data.attachments[0].url).toContain('/uploads/');
        });

        it('should fail if no file is uploaded', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const response = await request(app)
                .post(`/tasks/${task._id}/attachments`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('No file uploaded');
        });

        it('should fail with invalid file type', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const task = await createTestTask(user._id);

            const invalidFilePath = path.join(__dirname, 'test.exe');
            fs.writeFileSync(invalidFilePath, 'invalid');

            const response = await request(app)
                .post(`/tasks/${task._id}/attachments`)
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('file', invalidFilePath)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid file type');

            fs.unlinkSync(invalidFilePath);
        });
    });
});
