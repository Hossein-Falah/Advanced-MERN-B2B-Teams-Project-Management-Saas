import { ZodError } from "zod";
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService, getUserProfileService, updateUserProfileService } from "../services/user.service";
import { updateUserSchema } from "../validation/user.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { user } = await getCurrentUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User fetch successfully",
      user,
    });
  }
);

export const updateProfileController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;

      const body = updateUserSchema.parse(req.body);

      const user = await updateUserProfileService(userId, body, req.file);

      return res.status(HTTPSTATUS.OK).json({
        message: "user updated successfully",
        user,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }

      res.status(500).json({
        message: "Error updating profile",
      });
    }
  }
);

export const getUserProfileController = asyncHandler(
  async (req: Request, res: Response) => {

    const { username, workspaceId } = req.query;

    const workspace = workspaceIdSchema.parse(workspaceId);

    const profile = await getUserProfileService(
      username as string,
      workspace as string
    );

    return res.status(HTTPSTATUS.OK).json(profile);
  }
);
