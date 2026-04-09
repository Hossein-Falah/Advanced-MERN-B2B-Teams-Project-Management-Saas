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

export default analyticsRoutes;
