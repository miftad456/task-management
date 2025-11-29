import { TaskModel } from "../model/task_model.js";

export const taskRepository = {
    async create(taskEntity) {
        const newTask = await TaskModel.create(taskEntity);
        return newTask.toObject();
    },

    async findById(id) {
        return await TaskModel.findById(id).lean();
    },

    async findAllByUserId(userId) {
        return await TaskModel.find({ userId }).lean();
    },

    async update(id, data) {
        return await TaskModel.findByIdAndUpdate(id, data, { new: true }).lean();
    },

    async delete(id) {
        return await TaskModel.findByIdAndDelete(id);
    }
};
