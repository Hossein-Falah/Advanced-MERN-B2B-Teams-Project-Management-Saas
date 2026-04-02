import { Router } from "express";
import { 
    createAutomationController, 
    deleteAutomationController, 
    getAllAutomationController, 
    getOneAutomationController, 
    updateAutomationController
} from "./automation.controller";

const automationRoutes = Router();

automationRoutes.post("/workspace/:workspaceId/create", createAutomationController);
automationRoutes.get("/workspace/:workspaceId/all", getAllAutomationController)
automationRoutes.get("/workspace/:workspaceId/getById/:automationId", getOneAutomationController)
automationRoutes.patch("/workspace/:workspaceId/update/:automationId", updateAutomationController)
automationRoutes.delete("/workspace/:workspaceId/delete/:automationId", deleteAutomationController)

export default automationRoutes;
