export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TaskManagement API',
            version: '1.0.0',
            description: 'A comprehensive task management API with team collaboration features',
            contact: {
                name: 'API Support',
                email: 'support@taskmanagement.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'http://localhost:3001',
                description: 'Test server',
            },
        ],
        // ✅ Control order of tags here
        tags: [
            {
                name: 'Users',
                description: 'User authentication and profile management',
            },
            {
                name: 'Tasks',
                description: 'Task management operations',
            },
            {
                name: 'Teams',
                description: 'Team and member management',
            },
            {
                name: 'Comments',
                description: 'Task comments management',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token from the login endpoint',
                },
            },
            schemas: {
                // -------------------- Users --------------------
                UserInput: {
                    type: 'object',
                    required: ['name', 'username', 'email', 'password'],
                    properties: {
                        name: { type: 'string', example: 'John Doe' },
                        username: { type: 'string', example: 'johndoe' },
                        email: { type: 'string', format: 'email', example: 'john@example.com' },
                        password: { type: 'string', minLength: 6, example: 'password123' },
                    },
                },
                UserResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['user', 'manager'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                LoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', example: 'johndoe' },
                        password: { type: 'string', example: 'password123' },
                    },
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        user: { $ref: '#/components/schemas/UserResponse' },
                        token: {
                            type: 'object',
                            properties: {
                                accessToken: { type: 'string' },
                                refreshToken: { type: 'string' },
                            },
                        },
                    },
                },
                // -------------------- Tasks --------------------
                TaskInput: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: { type: 'string', example: 'Complete project documentation' },
                        description: { type: 'string', example: 'Write comprehensive API docs' },
                        priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
                        status: { type: 'string', enum: ['pending', 'in-progress', 'completed'], example: 'pending' },
                        deadline: { type: 'string', format: 'date-time', example: '2025-12-31T23:59:59Z' },
                        urgentBeforeMinutes: { type: 'number', example: 60 },
                    },
                },
                TaskResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        priority: { type: 'string' },
                        status: { type: 'string' },
                        deadline: { type: 'string', format: 'date-time' },
                        userId: { type: 'string' },
                        assignedBy: { type: 'string', nullable: true },
                        teamId: { type: 'string', nullable: true },
                        timeSpent: { type: 'number' },
                        urgentBeforeMinutes: { type: 'number' },
                        commentCount: { type: 'number', description: 'Number of comments on this task' },
                        attachments: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    filename: { type: 'string' },
                                    originalName: { type: 'string' },
                                    url: { type: 'string' },
                                    mimetype: { type: 'string' },
                                    size: { type: 'number' },
                                    uploadedAt: { type: 'string', format: 'date-time' },
                                },
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                // -------------------- TimeLogs --------------------
                TimeLogInput: {
                    type: 'object',
                    required: ['minutes'],
                    properties: {
                        minutes: { type: 'number', example: 30 },
                        note: { type: 'string', example: 'Fixed bugs in the login flow' },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                    },
                },
                TimeLogResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        taskId: { type: 'string' },
                        userId: { type: 'string' },
                        duration: { type: 'number' },
                        note: { type: 'string' },
                        startTime: { type: 'string', format: 'date-time' },
                        endTime: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                // -------------------- Teams --------------------
                TeamInput: {
                    type: 'object',
                    required: ['name'],
                    properties: { name: { type: 'string', example: 'Engineering Team' } },
                },
                TeamResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        managerId: { type: 'string' },
                        members: { type: 'array', items: { type: 'string' } },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                // -------------------- Comments --------------------
                CommentInput: {
                    type: 'object',
                    required: ['content'],
                    properties: {
                        content: { type: 'string', minLength: 1, maxLength: 1000, example: 'This is a helpful comment' },
                    },
                },
                CommentResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        content: { type: 'string' },
                        taskId: { type: 'string' },
                        userId: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                username: { type: 'string', example: 'johndoe' },
                                name: { type: 'string', example: 'John Doe' },
                            },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                // -------------------- Common Responses --------------------
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string', example: 'Error message' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./api/router/*.js', './api/router/swagger.docs.js'],
};
