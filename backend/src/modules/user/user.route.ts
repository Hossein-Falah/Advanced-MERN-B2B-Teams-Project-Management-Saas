import { RequestHandler, Router } from "express";
import upload from "../../common/middlewares/upload.middelware";
import { getContainer } from "../../app/container";

const userRoutes = Router();

const singleUpload: RequestHandler = upload.single("profilePicture");

const { userController } = getContainer();

userRoutes.get("/current", userController.getCurrentUser);

userRoutes.patch(
    "/update", 
    singleUpload,
    userController.updateProfile
);

userRoutes.get('/profile', userController.getUserProfile);

export default userRoutes;
