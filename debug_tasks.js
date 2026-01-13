import mongoose from 'mongoose';
import { TaskModel } from './backend/infrastructure/model/task_model.js';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/task_management');
        console.log('Connected to DB');

        const tasks = await TaskModel.find({ assignedBy: { $ne: null } });
        console.log('Tasks with assignedBy:', JSON.stringify(tasks, null, 2));

        const allTasks = await TaskModel.find({});
        console.log('All Tasks count:', allTasks.length);

        // Check specifically for tasks that SHOULD be assigned
        const potentialAssigned = allTasks.filter(t => t.assignedBy);
        console.log('Potential assigned tasks (JS filter):', potentialAssigned.length);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
