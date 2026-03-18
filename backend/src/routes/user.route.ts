import { RequestHandler, Router } from "express";
import { getCurrentUserController, updateProfileController } from "../controllers/user.controller";
import upload from "../middlewares/upload.middelware";

const userRoutes = Router();

const singleUpload: RequestHandler = upload.single("profilePicture");

userRoutes.get("/current", getCurrentUserController);

userRoutes.patch(
    "/update", 
    singleUpload,
    updateProfileController
);

export default userRoutes;
