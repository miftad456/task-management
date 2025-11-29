export class Task {
    constructor({ id, title, description, priority, status, deadline, userId, createdAt, timeSpent = 0 }) {
        this.id = id;                 // Unique identifier
        this.title = title;           // Task title
        this.description = description || "";
        this.priority = priority || "medium"; // low | medium | high
        this.status = status || "pending";    // pending | in-progress | completed
        this.deadline = deadline || null;
        this.userId = userId;         // Owner of the task
        this.createdAt = createdAt || new Date();
        this.timeSpent = timeSpent;   // Track how much time user spent on task (in minutes)
    }

    // Mark task as completed
    markCompleted() {
        this.status = "completed";
    }

    // Update task priority
    setPriority(priority) {
        const allowed = ["low", "medium", "high"];
        if (!allowed.includes(priority)) throw new Error("Invalid priority");
        this.priority = priority;
    }

    // Track time spent on task
    addTime(minutes) {
        if (minutes < 0) throw new Error("Time must be positive");
        this.timeSpent += minutes;
    }

    // Convert to DTO
    toDTO() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            priority: this.priority,
            status: this.status,
            deadline: this.deadline,
            userId: this.userId,
            timeSpent: this.timeSpent,
            createdAt: this.createdAt,
        };
    }
}
