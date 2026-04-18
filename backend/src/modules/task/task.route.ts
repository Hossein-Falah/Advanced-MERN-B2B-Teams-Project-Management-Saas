import { RequestHandler, Router } from "express";
import { getContainer } from "../../app/container";
import upload from "../../common/middlewares/upload.middelware";

const taskRoutes = Router();

const singleUpload: RequestHandler = upload.single("attachment");

const { taskController } = getContainer()

taskRoutes.post(
  "/project/:projectId/workspace/:workspaceId/create",
  singleUpload,
  taskController.createTask
);

taskRoutes.post(
  "/clone",
  taskController.cloneTask
);

taskRoutes.put(
  "/:id/project/:projectId/workspace/:workspaceId/update",
  singleUpload,
  taskController.updateTask
);

taskRoutes.get("/workspace/:workspaceId/all", taskController.getAllTasks);

taskRoutes.get(
  "/:id/project/:projectId/workspace/:workspaceId",
  taskController.getTaskById
);

taskRoutes.post("/workspace/:workspaceId/undo/:taskId/log/:logId", taskController.undoTask);

taskRoutes.post("/workspace/:workspaceId/redo/:taskId/log/:logId", taskController.redoTask);

taskRoutes.delete("/delete", taskController.deleteTask);

export default taskRoutes;
