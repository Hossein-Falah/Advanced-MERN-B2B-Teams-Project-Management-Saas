import { Router } from "express";
import { 
    createAutomationController, 
    deleteAutomationController, 
    getAllAutomationController, 
    getOneAutomationController, 
    updateAutomationController
} from "./automation.controller";

const automationRoutes = Router();

automationRoutes.post("/create", createAutomationController);
automationRoutes.get("/all", getAllAutomationController)
automationRoutes.get("/getById/:automationId", getOneAutomationController)
automationRoutes.patch("/update/:automationId", updateAutomationController)
automationRoutes.delete("/delete/:automationId", deleteAutomationController)

export default automationRoutes;
