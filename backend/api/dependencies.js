import { userRepository } from "../infrastructure/repository/user_repo.js";
import { taskRepository } from "../infrastructure/repository/task_repo.js";
import { teamRepository } from "../infrastructure/repository/team_repo.js";
import { timeLogRepository } from "../infrastructure/repository/time_log_repo.js";
import { commentRepository } from "../infrastructure/repository/comment_repo.js";

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
  getTimeLogsUsecase,
  uploadAttachmentUsecase,
  assignTaskUsecase,
  getAssignedTasksUsecase,
  deleteCompletedTasksUsecase,
} from "../usecase/task/task.usecase.js";

import { getTeamTasksUsecase } from "../usecase/task/getTeamTasks.usecase.js";
import { getTeamMemberTasksUsecase } from "../usecase/task/getTeamMemberTasks.usecase.js";
import { getMyTeamTasksUsecase } from "../usecase/task/getMyTeamTasks.usecase.js";

import {
  submitTaskUsecase,
  reviewTaskUsecase,
} from "../usecase/task/submission.usecase.js";
import { getUserDashboardUsecase, getTeamDashboardUsecase } from "../usecase/dashboard/dashboard.usecase.js";
// User usecases
import {
  registerUserUsecase,
  loginUserUsecase,
  updateUserUsecase,
  getUserUsecase,
  refreshTokenUsecase,
  logoutUsecase,
} from "../usecase/user/user.usecase.js";
import {
  updateProfileUsecase,
  getProfileUsecase,
} from "../usecase/user/profile.usecase.js";

// Team usecases
import { teamUsecase } from "../usecase/team/team.usecase.js";
import { getTeamProfileUsecase, updateTeamProfileUsecase } from "../usecase/team/teamprofile.usecase.js";
// Comment usecases
import {
  createCommentUsecase,
  getCommentsByTaskUsecase,
  updateCommentUsecase,
  deleteCommentUsecase,
} from "../usecase/comment/comment.usecase.js";

export const dependencies = {
  repos: {
    userRepository,
    taskRepository,
    teamRepository,
    timeLogRepository,
    commentRepository,
  },

  services: {
    passwordService,
    jwtService,
  },

  usecases: {
    // Task usecases
    createTaskUsecase: createTaskUsecase(taskRepository),
    updateTaskUsecase: updateTaskUsecase(taskRepository),
    deleteTaskUsecase: deleteTaskUsecase(taskRepository, teamRepository),
    getTaskUsecase: getTaskUsecase(taskRepository, teamRepository),
    getAllTasksUsecase: getAllTasksUsecase(taskRepository),
    trackTimeUsecase: trackTimeUsecase(taskRepository, timeLogRepository),
    updateStatusUsecase: updateStatusUsecase(taskRepository),
    updatePriorityUsecase: updatePriorityUsecase(taskRepository),
    getOverdueTasksUsecase: getOverdueTasksUsecase(taskRepository),
    getUrgentTasksUsecase: getUrgentTasksUsecase({ taskRepository }),
    getTimeLogsUsecase: getTimeLogsUsecase(timeLogRepository),
    uploadAttachmentUsecase: uploadAttachmentUsecase(taskRepository),
    assignTaskUsecase: assignTaskUsecase(taskRepository, teamRepository),
    getAssignedTasksUsecase: getAssignedTasksUsecase(taskRepository),
    deleteCompletedTasksUsecase: deleteCompletedTasksUsecase(taskRepository),
    submitTaskUsecase: submitTaskUsecase(taskRepository),
    reviewTaskUsecase: reviewTaskUsecase(taskRepository),
    getTeamTasksUsecase: getTeamTasksUsecase(taskRepository, teamRepository),
    getTeamMemberTasksUsecase: getTeamMemberTasksUsecase(taskRepository, teamRepository),
    getMyTeamTasksUsecase: getMyTeamTasksUsecase(taskRepository, teamRepository),

    // User usecases
    registerUserUsecase: registerUserUsecase({ userRepository, passwordService }),
    loginUserUsecase: loginUserUsecase({ userRepository, passwordService, jwtService }),
    updateUserUsecase: updateUserUsecase({ userRepository }),
    getUserUsecase: getUserUsecase({ userRepository }),
    refreshTokenUsecase: refreshTokenUsecase({ userRepository, jwtService }),
    logoutUsecase: logoutUsecase({ userRepository, jwtService }),
    updateProfileUsecase: updateProfileUsecase(userRepository),
    getProfileUsecase: getProfileUsecase(userRepository),

    // Team usecases
    teamUsecase: teamUsecase({ teamRepository, userRepository }),
    teamProfileUsecase: getTeamProfileUsecase({ teamRepository }),
    updateTeamProfileUsecase: updateTeamProfileUsecase({ teamRepository }),

    // Comment usecases
    createCommentUsecase: createCommentUsecase(commentRepository, taskRepository, teamRepository),
    getCommentsByTaskUsecase: getCommentsByTaskUsecase(commentRepository, taskRepository, teamRepository),
    updateCommentUsecase: updateCommentUsecase(commentRepository),
    deleteCommentUsecase: deleteCommentUsecase(commentRepository),
    // dashboard usecases
    getUserDashboardUsecase: getUserDashboardUsecase(taskRepository),
    getTeamDashboardUsecase: getTeamDashboardUsecase(taskRepository, teamRepository),

  },
};
