import { Router } from "express";
import { getContainer } from "../../app/container";

const analyticsRoutes = Router();

const { analyticsController } = getContainer()

analyticsRoutes.get(
  "/workspace/:workspaceId",
  analyticsController.getWorkspaceAnalytics
);

analyticsRoutes.get(
  "/profile/activity",
  analyticsController.getProfileActivity
)

analyticsRoutes.get("/tasks/workspace/:workspaceId", analyticsController.getTaskAnalytics);

analyticsRoutes.get("/projects/workspace/:workspaceId", analyticsController.getProjectAnalytics);

analyticsRoutes.get("/users/workspace/:workspaceId", analyticsController.getUserAnalytics);

export default analyticsRoutes;
