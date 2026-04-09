import { Router } from "express";
import { getContainer } from "../../app/container";

const taskLogRoutes = Router();

const { taskLogController } = getContainer()

taskLogRoutes.get(
  "/task/:taskId",
  taskLogController.getTaskLogsController
);

export default taskLogRoutes;
