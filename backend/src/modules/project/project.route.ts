import { Router } from "express";
import { getContainer } from "../../app/container";

const projectRoutes = Router();

const { projectController } = getContainer()

projectRoutes.post("/workspace/:workspaceId/create", projectController.createProject);

projectRoutes.put(
  "/:id/workspace/:workspaceId/update",
  projectController.updateProject
);

projectRoutes.delete(
  "/:id/workspace/:workspaceId/delete",
  projectController.deleteProject
);

projectRoutes.get(
  "/workspace/:workspaceId/all",
  projectController.getAllProjectsInWorkspace
);

projectRoutes.get(
  "/:id/workspace/:workspaceId/analytics",
  projectController.getAnalytics
);

projectRoutes.get(
  "/:id/workspace/:workspaceId",
  projectController.getProject
);

export default projectRoutes;
