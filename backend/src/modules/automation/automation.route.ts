import { Router } from "express";
import { getContainer } from "../../app/container";

const automationRoutes = Router();

const { automationController } = getContainer()

automationRoutes.post("/workspace/:workspaceId/create", automationController.createAutomation);
automationRoutes.get("/workspace/:workspaceId/all", automationController.getAutomations);
automationRoutes.get("/workspace/:workspaceId/getById/:automationId", automationController.getAutomation);
automationRoutes.patch("/workspace/:workspaceId/update/:automationId", automationController.updateAutomation);
automationRoutes.delete("/workspace/:workspaceId/delete/:automationId", automationController.deleteAutomation);

export default automationRoutes;
