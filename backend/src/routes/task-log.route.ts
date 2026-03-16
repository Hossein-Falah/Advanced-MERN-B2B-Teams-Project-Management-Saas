import { Router } from "express";
import { getTaskLogsController } from "../controllers/task-log.controller";

const taskLogRoutes = Router();

taskLogRoutes.get(
  "/task/:taskId",
  getTaskLogsController
);

export default taskLogRoutes;
