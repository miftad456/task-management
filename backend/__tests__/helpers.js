import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserModel } from '../infrastructure/model/user_model.js';
import { TaskModel } from '../infrastructure/model/task_model.js';
import { TeamModel } from '../infrastructure/model/team_model.js';
import { Team } from '../domain/entities/team.entity.js';
import { teamRepository } from '../infrastructure/repository/team_repo.js';

/**
 * Create a test user in the database
 * @param {Object} userData - User data (optional)
 * @returns {Promise<Object>} Created user object
 */
export const createTestUser = async (userData = {}) => {
    const defaultUser = {
        name: userData.name || 'Test User',
        username: userData.username || `testuser_${Date.now()}`,
        email: userData.email || `test_${Date.now()}@example.com`,
        password: userData.password || 'password123',
        role: userData.role || 'user',
    };

    // Hash the password
    const hashedPassword = await bcrypt.hash(defaultUser.password, 10);

    const user = await UserModel.create({
        ...defaultUser,
        password: hashedPassword,
    });

    // Return user with plain password for testing login
    return {
        ...user.toObject(),
        plainPassword: defaultUser.password,
    };
};

/**
 * Create a test manager user
 * @param {Object} userData - User data (optional)
 * @returns {Promise<Object>} Created manager user object
 */
export const createTestManager = async (userData = {}) => {
    return createTestUser({ ...userData, role: 'manager' });
};

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object
 * @returns {Object} Access and refresh tokens
 */
export const generateTestToken = (user) => {
    const payload = {
        userId: user._id || user.id,
        username: user.username,
        email: user.email,
        role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'test-refresh-secret', {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

/**
 * Create a test task
 * @param {string} userId - User ID who owns the task
 * @param {Object} taskData - Task data (optional)
 * @returns {Promise<Object>} Created task object
 */
export const createTestTask = async (userId, taskData = {}) => {
    const defaultTask = {
        title: taskData.title || 'Test Task',
        description: taskData.description || 'Test task description',
        priority: taskData.priority || 'medium',
        status: taskData.status || 'pending',
        deadline: taskData.deadline !== undefined ? taskData.deadline : new Date(Date.now() + 86400000), // Tomorrow
        userId: userId,
        timeSpent: taskData.timeSpent || 0,
        urgentBeforeMinutes: taskData.urgentBeforeMinutes || null,
    };

    const task = await TaskModel.create(defaultTask);
    return task.toObject();
};

/**
 * Create a test team
 * @param {string} managerId - Manager user ID
 * @param {Object} teamData - Team data (optional)
 * @returns {Promise<Object>} Created team object
 */
export const createTestTeam = async (managerId, teamData = {}) => {
    const defaultTeam = {
        name: teamData.name || `Test Team ${Date.now()}`,
        managerId: managerId,
        members: teamData.members || [],
    };

    const team = new Team(defaultTeam);
    return await teamRepository.create(team);
};

/**
 * Common test data fixtures
 */
export const fixtures = {
    validUser: {
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
    },
    validTask: {
        title: 'Complete project',
        description: 'Finish the task management system',
        priority: 'high',
        status: 'pending',
        deadline: new Date(Date.now() + 86400000),
    },
    validTeam: {
        name: 'Development Team',
    },
};
