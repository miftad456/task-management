export class User {
  constructor({ id, name, username, email, password, createdAt, role }) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role || "user"; // NEW: default role
    this.createdAt = createdAt || new Date();
  }

  isValid() {
    return (
      this.name &&
      this.username &&
      this.email &&
      this.password &&
      this.password.length >= 6
    );
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      username: this.username,
      email: this.email,
      role: this.role, // NEW
      createdAt: this.createdAt,
    };
  }
}
