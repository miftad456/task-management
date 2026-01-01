import request from 'supertest';
import { createServer } from '../server.js';
import { createTestUser, generateTestToken, fixtures } from './helpers.js';

const app = createServer();

describe('User API Endpoints', () => {
    describe('POST /users/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Alice Smith',
                username: 'alice123',
                email: 'alice@example.com',
                password: 'password123',
            };

            const response = await request(app)
                .post('/users/register')
                .send(userData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('User created');
            expect(response.body.data).toHaveProperty('id');
            expect(response.body.data.username).toBe('alice123');
            expect(response.body.data.email).toBe('alice@example.com');
            expect(response.body.data).not.toHaveProperty('password'); // Password should not be in response
        });

        it('should fail to register user with missing fields', async () => {
            const invalidUser = {
                username: 'bob',
                // Missing name, email, password
            };

            const response = await request(app)
                .post('/users/register')
                .send(invalidUser)
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail to register user with duplicate username', async () => {
            const user1 = await createTestUser({ username: 'duplicate' });

            const userData = {
                name: 'Another User',
                username: 'duplicate',
                email: 'another@example.com',
                password: 'password123',
            };

            const response = await request(app)
                .post('/users/register')
                .send(userData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /users/login', () => {
        it('should login user with correct credentials', async () => {
            const user = await createTestUser();

            const response = await request(app)
                .post('/users/login')
                .send({
                    username: user.username,
                    password: user.plainPassword,
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data).toHaveProperty('token');
            expect(response.body.data.token).toHaveProperty('accessToken');
            expect(response.body.data.token).toHaveProperty('refreshToken');
            expect(response.body.data.user.username).toBe(user.username);
        });

        it('should fail to login with incorrect password', async () => {
            const user = await createTestUser();

            const response = await request(app)
                .post('/users/login')
                .send({
                    username: user.username,
                    password: 'wrongpassword',
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        it('should fail to login with non-existent username', async () => {
            const response = await request(app)
                .post('/users/login')
                .send({
                    username: 'nonexistent',
                    password: 'password123',
                })
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /users/:id', () => {
        it('should get user profile with valid authentication', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            const response = await request(app)
                .get(`/users/${user._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.username).toBe(user.username);
            expect(response.body.data).not.toHaveProperty('password');
        });

        it('should fail to get user profile without authentication', async () => {
            const user = await createTestUser();

            const response = await request(app)
                .get(`/users/${user._id}`)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should fail to get non-existent user', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);
            const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format

            const response = await request(app)
                .get(`/users/${fakeId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /users/:id', () => {
        it('should update user profile successfully', async () => {
            const user = await createTestUser();
            const { accessToken } = generateTestToken(user);

            const updatedData = {
                name: 'Updated Name',
                username: user.username,
                email: user.email,
                password: user.plainPassword,
            };

            const response = await request(app)
                .put(`/users/${user._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send(updatedData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Name');
        });

        it('should fail to update user without authentication', async () => {
            const user = await createTestUser();

            const response = await request(app)
                .put(`/users/${user._id}`)
                .send({ name: 'New Name' })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /users/refresh-token', () => {
        it('should refresh access token with valid refresh token', async () => {
            const user = await createTestUser();

            // Login to get a valid refresh token that's saved in DB
            const loginResponse = await request(app)
                .post('/users/login')
                .send({
                    username: user.username,
                    password: user.plainPassword,
                });

            const { refreshToken } = loginResponse.body.data.token;

            const response = await request(app)
                .post('/users/refresh-token')
                .send({ refreshToken })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data).toHaveProperty('refreshToken');
        });
        it('should fail to refresh token without refresh token', async () => {
            const response = await request(app)
                .post('/users/refresh-token')
                .send({})
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should fail to refresh token with invalid token', async () => {
            const response = await request(app)
                .post('/users/refresh-token')
                .send({ refreshToken: 'invalid-token' })
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /users/logout', () => {
        it('should logout user successfully', async () => {
            const user = await createTestUser();

            // Login to get a valid refresh token that's saved in DB
            const loginResponse = await request(app)
                .post('/users/login')
                .send({
                    username: user.username,
                    password: user.plainPassword,
                });

            const { refreshToken } = loginResponse.body.data.token;

            const response = await request(app)
                .post('/users/logout')
                .send({ refreshToken })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Logout successful');
        });
        it('should fail to logout without refresh token', async () => {
            const response = await request(app)
                .post('/users/logout')
                .send({})
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });
});
