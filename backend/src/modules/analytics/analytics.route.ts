import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsRepository } from "./analytics.repository";
import TaskModel from "../../models/task.model";

const analyticsRoutes = Router();

const analyticsRepository = new AnalyticsRepository(TaskModel);
const analyticsService = new AnalyticsService(analyticsRepository);
const analyticsController = new AnalyticsController(analyticsService);

analyticsRoutes.get(
  "/workspace/:workspaceId",
  analyticsController.getWorkspaceAnalytics
);

analyticsRoutes.get(
  "/profile/activity",
  analyticsController.getProfileActivity
)

export default analyticsRoutes;
