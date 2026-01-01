import { TimeLogModel } from "../model/time_log_model.js";

const map = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
        id: obj._id.toString(),
        taskId: obj.taskId.toString(),
        userId: obj.userId.toString(),
        duration: obj.duration,
        note: obj.note,
        startTime: obj.startTime,
        endTime: obj.endTime,
        createdAt: obj.createdAt,
    };
};

export const timeLogRepository = {
    async create(logData) {
        const newLog = await TimeLogModel.create(logData);
        return map(newLog);
    },

    async findByTaskId(taskId) {
        const docs = await TimeLogModel.find({ taskId }).sort({ createdAt: -1 }).lean();
        return docs.map(map);
    },

    async findByUserId(userId) {
        const docs = await TimeLogModel.find({ userId }).sort({ createdAt: -1 }).lean();
        return docs.map(map);
    },

    async delete(id) {
        await TimeLogModel.findByIdAndDelete(id);
        return true;
    },
};
