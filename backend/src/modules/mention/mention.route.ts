import { Router } from "express";
import { mentionUsersController } from "./mention.controller";

const mentionRoutes = Router();

mentionRoutes.get("/workspace/:workspaceId", mentionUsersController);

export default mentionRoutes;
