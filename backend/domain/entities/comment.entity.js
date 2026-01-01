export class Comment {
    constructor({ id, content, taskId, userId, createdAt, updatedAt }) {
        this.id = id;
        this.content = content;
        this.taskId = taskId;
        this.userId = userId;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }

    toDTO() {
        return {
            id: this.id,
            content: this.content,
            taskId: this.taskId,
            userId: this.userId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
