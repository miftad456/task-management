import request from 'supertest';
import { createServer } from '../server.js';
import { createTestUser, createTestManager, createTestTeam, generateTestToken } from './helpers.js';
import { NotificationModel } from '../infrastructure/model/notification_model.js';

const app = createServer();

describe('Notification API Endpoints', () => {
    let manager, member, team, managerToken, memberToken;

    beforeEach(async () => {
        manager = await createTestManager();
        member = await createTestUser();
        team = await createTestTeam(manager._id, { members: [member._id] });
        managerToken = generateTestToken(manager).accessToken;
        memberToken = generateTestToken(member).accessToken;
    });

    describe('Task Assignment Notification', () => {
        it('should create a notification when a task is assigned', async () => {
            const taskData = {
                title: 'Assigned Task',
                description: 'Task Description',
                deadline: new Date(Date.now() + 86400000).toISOString(),
                priority: 'high',
                userId: member._id.toString(),
                teamId: team.id
            };

            await request(app)
                .post('/tasks/assign')
                .set('Authorization', `Bearer ${managerToken}`)
                .send(taskData)
                .expect(200);

            const notifications = await NotificationModel.find({ recipientId: member._id });
            expect(notifications.length).toBe(1);
            expect(notifications[0].type).toBe('task_assigned');
            expect(notifications[0].isUrgent).toBe(true);
            expect(notifications[0].message).toContain('Assigned Task');
        });
    });

    describe('Leave Request Notification', () => {
        it('should create a notification for manager when member requests leave', async () => {
            await request(app)
                .delete(`/teams/${team.id}/leave`)
                .set('Authorization', `Bearer ${memberToken}`)
                .expect(200);

            const notifications = await NotificationModel.find({ recipientId: manager._id });
            expect(notifications.length).toBe(1);
            expect(notifications[0].type).toBe('leave_request');
            expect(notifications[0].isUrgent).toBe(true);
            expect(notifications[0].message).toContain('requested to leave');
        });
    });

    describe('GET /notifications', () => {
        it('should fetch notifications for the current user', async () => {
            await NotificationModel.create({
                recipientId: member._id,
                type: 'task_assigned',
                message: 'Test Notification',
                isRead: false
            });

            const response = await request(app)
                .get('/notifications')
                .set('Authorization', `Bearer ${memberToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.notifications.length).toBe(1);
            expect(response.body.data.unreadCount).toBe(1);
            expect(response.body.data.notifications[0].message).toBe('Test Notification');
        });
    });

    describe('PUT /notifications/:id/read', () => {
        it('should mark a notification as read', async () => {
            const notification = await NotificationModel.create({
                recipientId: member._id,
                type: 'task_assigned',
                message: 'Test Notification',
                isRead: false
            });

            const response = await request(app)
                .put(`/notifications/${notification._id}/read`)
                .set('Authorization', `Bearer ${memberToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.isRead).toBe(true);

            const updated = await NotificationModel.findById(notification._id);
            expect(updated.isRead).toBe(true);
        });
    });

    describe('Comment Notification', () => {
        it('should create a notification when a comment is added to a team task', async () => {
            const taskData = {
                title: 'Team Task',
                userId: member._id.toString(),
                teamId: team.id,
                priority: 'medium'
            };

            const taskResponse = await request(app)
                .post('/tasks/assign')
                .set('Authorization', `Bearer ${managerToken}`)
                .send(taskData);

            const taskId = taskResponse.body.data.id;

            // Manager comments on member's task
            await request(app)
                .post(`/comments/task/${taskId}`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({ content: 'Manager comment' })
                .expect(200);

            const notifications = await NotificationModel.find({ recipientId: member._id, type: 'comment_added' });
            expect(notifications.length).toBe(1);
            expect(notifications[0].message).toContain('New comment on your task');
        });
    });

    describe('Task Review Notification', () => {
        let taskId;

        beforeEach(async () => {
            const taskData = {
                title: 'Review Task',
                userId: member._id.toString(),
                teamId: team.id,
                priority: 'medium'
            };

            const taskResponse = await request(app)
                .post('/tasks/assign')
                .set('Authorization', `Bearer ${managerToken}`)
                .send(taskData);

            taskId = taskResponse.body.data.id;

            // Member submits task
            await request(app)
                .post(`/submissions/task/${taskId}`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ link: 'http://test.com', note: 'Done' })
                .expect(200);
        });

        it('should create a notification when a task is approved', async () => {
            await request(app)
                .put(`/submissions/task/${taskId}/review`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({ action: 'approve', note: 'Good job' })
                .expect(200);

            const notifications = await NotificationModel.find({ recipientId: member._id, type: 'task_approved' });
            expect(notifications.length).toBe(1);
            expect(notifications[0].message).toContain('approved');
        });

        it('should create a notification when a task is rejected', async () => {
            await request(app)
                .put(`/submissions/task/${taskId}/review`)
                .set('Authorization', `Bearer ${managerToken}`)
                .send({ action: 'reject', note: 'Needs work' })
                .expect(200);

            const notifications = await NotificationModel.find({ recipientId: member._id, type: 'task_rejected' });
            expect(notifications.length).toBe(1);
            expect(notifications[0].message).toContain('rejected');
            expect(notifications[0].isUrgent).toBe(true);
        });
    });
});
