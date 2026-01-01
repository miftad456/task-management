import { TaskModel } from "../model/task_model.js";

const map = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    title: obj.title,
    description: obj.description,
    priority: obj.priority,
    status: obj.status,
    deadline: obj.deadline,
    urgentBeforeMinutes: obj.urgentBeforeMinutes || null,
    timeSpent: obj.timeSpent || 0,
    userId: obj.userId,
    assignedBy: obj.assignedBy || null,
    teamId: obj.teamId || null,
    attachments: obj.attachments || [],
    createdAt: obj.createdAt,
  };
};

export const taskRepository = {
  async create(taskEntity) {
    const toSave = {
      title: taskEntity.title,
      description: taskEntity.description,
      priority: taskEntity.priority,
      status: taskEntity.status,
      deadline: taskEntity.deadline,
      urgentBeforeMinutes: taskEntity.urgentBeforeMinutes || null,
      timeSpent: taskEntity.timeSpent || 0,
      userId: taskEntity.userId,
      assignedBy: taskEntity.assignedBy || null,
      teamId: taskEntity.teamId || null,
      attachments: taskEntity.attachments || [],
    };
    const newTask = await TaskModel.create(toSave);
    return map(newTask);
  },

  async findById(id) {
    const doc = await TaskModel.findById(id).lean();
    if (!doc) return null;
    return map(doc);
  },

  async findAllByUserId(userId, search = "") {
    const match = { userId };
    if (search) {
      match.title = { $regex: search, $options: "i" };
    }

    // Use aggregation to sort null deadlines last by replacing them with a far future date
    const docs = await TaskModel.aggregate([
      { $match: match },
      {
        $addFields: {
          sortDeadline: { $ifNull: ["$deadline", new Date("9999-12-31")] }
        }
      },
      {
        $sort: {
          sortDeadline: 1,
          createdAt: -1 // Secondary sort by creation date
        }
      }
    ]);

    // Convert aggregation results back to objects that map() can handle
    return docs.map(doc => map({ ...doc, _id: doc._id }));
  },

  async update(id, data) {
    // Accept partial update data including urgentBeforeMinutes
    const updated = await TaskModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!updated) return null;
    return map(updated);
  },

  async delete(id) {
    await TaskModel.findByIdAndDelete(id);
    return true;
  },

  async updateStatus(id, status) {
    const updated = await TaskModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    if (!updated) return null;
    return map(updated);
  },

  async updatePriority(id, priority) {
    const updated = await TaskModel.findByIdAndUpdate(id, { priority }, { new: true }).lean();
    if (!updated) return null;
    return map(updated);
  },

  async findAllAssignedToUserId(userId) {
    // Find tasks where userId matches but assignedBy is NOT null and NOT the user themselves
    const docs = await TaskModel.find({
      userId,
      assignedBy: { $exists: true, $ne: null }
    }).sort({ deadline: 1 }).lean();
    return docs.map(map);
  },

  async findAllByTeamId(teamId) {
    // Find all tasks for a specific team
    const docs = await TaskModel.find({ teamId }).sort({ deadline: 1, createdAt: -1 }).lean();
    return docs.map(map);
  },

  async findTeamTasksByUserId(teamId, userId) {
    // Find tasks for a specific user within a team
    const docs = await TaskModel.find({ teamId, userId }).sort({ deadline: 1, createdAt: -1 }).lean();
    return docs.map(map);
  },
  // ===== DASHBOARD COUNTS =====

  async countByUser(userId) {
    return TaskModel.countDocuments({ userId });
  },

  async countByUserAndStatus(userId, status) {
    return TaskModel.countDocuments({ userId, status });
  },

  async countOverdueByUser(userId) {
    return TaskModel.countDocuments({
      userId,
      deadline: { $lt: new Date() },
      status: { $nin: ["completed", "submitted"] },
    });
  },

  async countDueTodayByUser(userId) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return TaskModel.countDocuments({
      userId,
      deadline: { $gte: start, $lte: end },
      status: { $nin: ["completed", "submitted"] },
    });
  },

  async countByTeam(teamId) {
    return TaskModel.countDocuments({ teamId });
  },

  async countByTeamAndStatus(teamId, status) {
    return TaskModel.countDocuments({ teamId, status });
  },

  async countOverdueByTeam(teamId) {
    return TaskModel.countDocuments({
      teamId,
      deadline: { $lt: new Date() },
      status: { $nin: ["completed", "submitted"] },
    });
  },

};
