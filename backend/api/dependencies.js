import { userRepository } from "../infrastructure/repository/user_repo.js";
import { taskRepository } from "../infrastructure/repository/task_repo.js";

import { passwordService } from "../infrastructure/service/password_service.js";
import { jwtService } from "../infrastructure/service/jwt_service.js";

// Task usecases
import {
  createTaskUsecase,
  updateTaskUsecase,
  deleteTaskUsecase,
  getTaskUsecase,
  getAllTasksUsecase,
  trackTimeUsecase,
  updatePriorityUsecase,
  updateStatusUsecase,
  getOverdueTasksUsecase,
  getUrgentTasksUsecase,
} from "../usecase/task/task.usecase.js";

// User usecases
import {
  registerUserUsecase,
  loginUserUsecase,
  updateUserUsecase,
  getUserUsecase,
  refreshTokenUsecase,
  logoutUsecase,
  
} from "../usecase/user/user.usecase.js";

export const dependencies = {
  repos: {
    userRepository,
    taskRepository,
  },

  services: {
    passwordService,
    jwtService,
  },

  usecases: {
    // Task usecases
    createTaskUsecase: createTaskUsecase(taskRepository),
    updateTaskUsecase: updateTaskUsecase(taskRepository),
    deleteTaskUsecase: deleteTaskUsecase(taskRepository),
    getTaskUsecase: getTaskUsecase(taskRepository),
    getAllTasksUsecase: getAllTasksUsecase(taskRepository),
    trackTimeUsecase: trackTimeUsecase(taskRepository),
    updateStatusUsecase: updateStatusUsecase(taskRepository),
    updatePriorityUsecase: updatePriorityUsecase(taskRepository),
    getOverdueTasksUsecase : getOverdueTasksUsecase (taskRepository),
    getUrgentTasksUsecase: getUrgentTasksUsecase ({taskRepository}),

    // User usecases
    registerUserUsecase: registerUserUsecase({ userRepository, passwordService }),
    loginUserUsecase: loginUserUsecase({ userRepository, passwordService, jwtService }),
    updateUserUsecase: updateUserUsecase({ userRepository }),
    getUserUsecase: getUserUsecase({ userRepository }),
    refreshTokenUsecase: refreshTokenUsecase({ userRepository, jwtService }),
    logoutUsecase: logoutUsecase({ userRepository, jwtService }),
  },
};
