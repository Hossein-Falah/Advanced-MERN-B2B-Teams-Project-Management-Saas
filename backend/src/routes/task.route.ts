import { RequestHandler, Router } from "express";

import {
  createTaskController,
  deleteTaskController,
  getAllTasksController,
  getTaskByIdController,
  updateTaskController,
} from "../controllers/task.controller";
import upload from "../middlewares/upload.middelware";

const taskRoutes = Router();

const singleUpload: RequestHandler = upload.single("attachment");

taskRoutes.post(
  "/project/:projectId/workspace/:workspaceId/create",
  singleUpload,
  createTaskController
);

taskRoutes.delete("/:id/workspace/:workspaceId/delete", deleteTaskController);

taskRoutes.put(
  "/:id/project/:projectId/workspace/:workspaceId/update",
  singleUpload,
  updateTaskController
);

taskRoutes.get("/workspace/:workspaceId/all", getAllTasksController);

taskRoutes.get(
  "/:id/project/:projectId/workspace/:workspaceId",
  getTaskByIdController
);

export default taskRoutes;
