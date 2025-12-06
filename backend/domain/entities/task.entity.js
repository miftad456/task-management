export class Task {
  constructor({ id, title, description, priority, status, deadline, userId, createdAt, timeSpent = 0, urgentBeforeMinutes = null }) {
    this.id = id;
    this.title = title;
    this.description = description || "";
    this.priority = priority || "medium";
    this.status = status || "pending";
    this.deadline = deadline || null;
    this.userId = userId;
    this.createdAt = createdAt || new Date();
    this.timeSpent = timeSpent;
    this.urgentBeforeMinutes = urgentBeforeMinutes; // NEW
  }

  markCompleted() {
    this.status = "completed";
  }

  setPriority(priority) {
    const allowed = ["low", "medium", "high"];
    if (!allowed.includes(priority)) throw new Error("Invalid priority");
    this.priority = priority;
  }

  addTime(minutes) {
    if (minutes < 0) throw new Error("Time must be positive");
    this.timeSpent += minutes;
  }

  isOverdue() {
    if (!this.deadline) return false;
    return new Date() > new Date(this.deadline) && this.status !== "completed";
  }

  isUrgent() {
    if (this.status === "completed") return false;
    const now = new Date();
    const deadline = new Date(this.deadline);

    // Use user-defined threshold if available
    if (this.urgentBeforeMinutes !== null) {
      const timeLeft = (deadline - now) / (1000 * 60); // minutes
      return timeLeft <= this.urgentBeforeMinutes;
    }

    // Default logic based on priority
    const timeLeft = (deadline - now) / (1000 * 60); // minutes
    if (this.priority === "high" && timeLeft <= 60) return true;
    if (this.priority === "medium" && timeLeft <= 30) return true;
    return false;
  }

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
      urgentBeforeMinutes: this.urgentBeforeMinutes, // NEW
      createdAt: this.createdAt,
    };
  }
}
