import { Task } from "../domain/entities/task.entity";
export const getTaskUsecase = (taskRepository)=>{
    const createTask  = async(taskData, userId) =>{
        taskData.userId =  userId;
        const task  = new Task(taskData);
        return await taskRepository.create(task);

    };
    // get single task 

    const  getTask  = async(id , userId)=>{
    const task  = taskRepository.findById(id);
    if (!task) throw new Error("task id not found");
    if (task.userId  !== userId){
        throw new Error("not allowed to acces this task");

    };
    return task;

    };
    // get all task
    const getAll =  async(userId)=>{
        return await taskRepository.findAllByuserId(userId);
    };

    // update task
    const updatetask  = async(id,updates,userId)=>{
        const  task  = await getTask(id,userId);
        const updatedtask  = await taskRepository.update(id,updates);
        return updatedtask;

    }
     // DELETE TASK
    const deleteTask = async (id, userId) => {
        const task = await getTask(id, userId);
        await taskRepository.delete(id);
        return true;
    };

    // TRACK TIME SPENT
    const trackTime = async (taskId, minutes, userId) => {
        const task = await getTask(taskId, userId);

        task.addTime(minutes);

        return await taskRepository.update(taskId, task);
    };

    return {
        createTask,
        getTask,
        getAll,
        updateTask,
        deleteTask,
        trackTime
    };
};







