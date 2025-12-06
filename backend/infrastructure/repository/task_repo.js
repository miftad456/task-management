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
    urgentBeforeMinutes: obj.urgentBeforeMinutes || null, // new field
    timeSpent: obj.timeSpent || 0,
    userId: obj.userId,
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
      urgentBeforeMinutes: taskEntity.urgentBeforeMinutes || null, // save new field
      timeSpent: taskEntity.timeSpent || 0,
      userId: taskEntity.userId,
    };
    const newTask = await TaskModel.create(toSave);
    return map(newTask);
  },

  async findById(id) {
    const doc = await TaskModel.findById(id).lean();
    if (!doc) return null;
    return map(doc);
  },

  async findAllByUserId(userId) {
    const docs = await TaskModel.find({ userId }).lean();
    return docs.map(map);
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
};
