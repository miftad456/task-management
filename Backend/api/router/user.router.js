import express from "express";
import { validateUser } from "../schema/user.schema.js";
import { toUserResponseDTO } from "../dto/user.dto.js";
import { success, failure } from "../utilities/response.js";

export const userRouter = (dependencies) => {
    const router = express.Router();
    const {
        createUserUsecase,
        updateUserUsecase,
        getUserUsecase,
    } = dependencies.usecases;

    // Register User
    router.post("/", validateUser, async (req, res) => {
        try {
            const data = await createUserUsecase.execute(req.body);
            res.json(success("User created", toUserResponseDTO(data)));
        } catch (err) {
            res.status(400).json(failure(err.message));
        }
    });

    // Get User Profile
    router.get("/:id", async (req, res) => {
        try {
            const user = await getUserUsecase.execute(req.params.id);
            res.json(success("User profile", toUserResponseDTO(user)));
        } catch (err) {
            res.status(404).json(failure(err.message));
        }
    });

    // Update User Profile
    router.put("/:id", validateUser, async (req, res) => {
        try {
            const user = await updateUserUsecase.execute(req.params.id, req.body);
            res.json(success("User updated", toUserResponseDTO(user)));
        } catch (err) {
            res.status(400).json(failure(err.message));
        }
    });

    return router;
};
