import { Router } from "express";
import { getContainer } from "../../app/container";

const notificationRoutes = Router();

const { notificationController } = getContainer()

notificationRoutes.get("/all", notificationController.getAllNotificationController);
notificationRoutes.post("/read/:notificationId", notificationController.readNotificationController);
notificationRoutes.post("/read-all", notificationController.readAllNotificationController);


export default notificationRoutes;
