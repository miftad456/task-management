export class LeaveRequest {
  constructor({ id, teamId, userId, status = "pending", createdAt }) {
    this.id = id;
    this.teamId = teamId;
    this.userId = userId;
    this.status = status; // pending | approved | rejected
    this.createdAt = createdAt || new Date();
  }

  approve() {
    if (this.status !== "pending") throw new Error("Request already processed");
    this.status = "approved";
  }

  reject() {
    if (this.status !== "pending") throw new Error("Request already processed");
    this.status = "rejected";
  }

  toDTO() {
    return {
      id: this.id,
      teamId: this.teamId,
      userId: this.userId,
      status: this.status,
      createdAt: this.createdAt,
    };
  }
}
