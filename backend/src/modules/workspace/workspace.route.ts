import { Router } from "express";
import { getContainer } from "../../app/container";

const workspaceRoutes = Router();

const { workspaceController } = getContainer();

workspaceRoutes.post("/create/new", workspaceController.createWorkspace);
workspaceRoutes.put("/update/:workspaceId", workspaceController.updateWorkspaceById);

workspaceRoutes.put(
  "/change/member/role/:workspaceId",
  workspaceController.changeWorkspaceMemberRole
);

workspaceRoutes.delete("/delete/:workspaceId", workspaceController.deleteWorkspaceById);

workspaceRoutes.get("/all", workspaceController.getAllWorkspacesUserIsMember);

workspaceRoutes.get("/members/:workspaceId", workspaceController.getWorkspaceMembers);
workspaceRoutes.get("/analytics/:workspaceId", workspaceController.getWorkspaceAnalytics);

workspaceRoutes.get("/:workspaceId", workspaceController.getWorkspaceById);

export default workspaceRoutes;
