import { Router } from "express";
import { getContainer } from "../../app/container";

const workspaceRoutes = Router();

const { workspaceController } = getContainer();

workspaceRoutes.post("/create/new", workspaceController.createWorkspace);
workspaceRoutes.put("/update/:id", workspaceController.updateWorkspaceById);

workspaceRoutes.put(
  "/change/member/role/:id",
  workspaceController.changeWorkspaceMemberRole
);

workspaceRoutes.delete("/delete/:id", workspaceController.deleteWorkspaceById);

workspaceRoutes.get("/all", workspaceController.getAllWorkspacesUserIsMember);

workspaceRoutes.get("/members/:id", workspaceController.getWorkspaceMembers);
workspaceRoutes.get("/analytics/:id", workspaceController.getWorkspaceAnalytics);

workspaceRoutes.get("/:id", workspaceController.getWorkspaceById);

export default workspaceRoutes;
