import { Router } from "express";
import { getContainer } from "../../app/container";

const memberRoutes = Router();

const { memberController } = getContainer()

memberRoutes.post("/workspace/:inviteCode/join", memberController.joinWorkspace);

export default memberRoutes;
