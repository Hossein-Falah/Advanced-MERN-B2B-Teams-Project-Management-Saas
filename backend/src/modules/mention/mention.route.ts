import { Router } from "express";
import { getContainer } from "../../app/container";

const mentionRoutes = Router();

const { mentionController } = getContainer();

mentionRoutes.get("/workspace/:workspaceId", mentionController.mentionUsers);

export default mentionRoutes;
