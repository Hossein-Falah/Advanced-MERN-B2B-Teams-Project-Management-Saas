import { Router } from "express";
import { getContainer } from "../../app/container";

const fileRoutes = Router();

const { fileController } = getContainer()

fileRoutes.get("/", fileController.getFiles);

export default fileRoutes;
