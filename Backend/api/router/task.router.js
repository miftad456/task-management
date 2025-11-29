import express from "express";
import {validateTask} from "../schema/task.schema.js";
import {toTaskResponseDTO} from "../dto/task.dto.js";
import {success,failure} from "../utilities/response.js"


export const taskRouter  = (dependencies)  => {
    const router  = express.Router();
    const{
        createTaskUsecase,
        updateTaskUsecase,
        deleteTaskUsecase,
        getTaskUsecase,
        getAllTaskUsecase,
    } =  dependencies.usecases;

    // create Task 
    router.post("/", validateTask,async(req,res)=>{
        try{
            const  data  = await createTaskUsecase.excute(req.body);
            res.json(success("Task created", toTaskResponseDTO(data)));

        }
        catch(err){
            res.status(400).json(failure(err.message));
        }
    });
    // get All TAsk 
    router.get("/",async(req,res)=>{
        try{
            const  tasks  = await getAllTaskUsecase.excute();
            res.json(success("Task fetched",tasks.map(toTaskResponseDTO())));

        }
        catch(arr){
            res.status(400).json(failure(err.message));
        }
    });


    // get Task by Id
    router.get("/:id",async(req,res)=>{
        try{
            const task =  await getTaskUsecase.excute(req.params.id);
            res.json(success("Task fetched",toTaskResponseDTO(task)))
        }
        catch(err){
            res.status(400).json(failure(err.message));
        }
    });
    // update task 
    router.put("/:id",validateTask,async(req,res)=>{
        try{
            const task = await updateTaskUsecase.excute(req.params.id);
            res.json(success("task Updated",toTaskResponseDTO(task)));

        }catch(err){
            res.status(400).json(failure(err.message));
        }
    });
    // delete task
    router.delete("/:id",async (req,res)=>{
        try{
        const task  = await deleteTaskUsecase.excute(req.params.id);
        res.json(success("task deleted",null));}
        catch(arr){
            res.status(400).json(failure(err.message));
        }
    })

}