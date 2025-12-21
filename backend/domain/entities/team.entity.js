// src/DOMAIN/entity/team.entity.js

export class Team {
  constructor({ id, name, managerId, members = [], createdAt }) {
    this.id = id;
    this.name = name;
    this.managerId = managerId; // user ID of the manager
    this.members = members; // array of user IDs
    this.createdAt = createdAt || new Date();
  }

  addMember(userId) {
    if (!userId) throw new Error("Invalid user ID");
    if (this.members.includes(userId)) throw new Error("User already in team");
    this.members.push(userId);
  }

  removeMember(userId) {
    if (!this.members.includes(userId)) throw new Error("User not in team");
    this.members = this.members.filter((id) => id !== userId);
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      managerId: this.managerId,
      members: this.members,
      createdAt: this.createdAt,
    };
  }
}
