import { Router } from "express";
import {
    getAllNotificationController,
    readAllNotificationController,
    readNotificationController
} from "../../controllers/notification.controller";

const notificationRoutes = Router();

notificationRoutes.get("/all", getAllNotificationController);
notificationRoutes.post("/read/:notificationId", readNotificationController);
notificationRoutes.post("/read-all", readAllNotificationController);


export default notificationRoutes;
