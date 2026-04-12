import { NextFunction, Request, Response } from "express";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { UserService } from "./user.service";
import { updateUserSchema } from "./user.validation";
import { workspaceIdSchema } from "../../common/validator/common.validator";

export class UserController {
  constructor(
    private userService: UserService
  ) { }

  getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {      
      const userId = req.user?._id;
  
      const user = await this.userService.getCurrentUser(userId);
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.USER.FETCHED.code,
        message: MESSAGES.USER.FETCHED.message,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {   
      const userId = req.user?._id;
      const body = updateUserSchema.parse(req.body);

      const user = await this.userService.updateUserProfile(
        userId,
        body,
        req.file
      );

      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.USER.PROFILE_UPDATED.code,
        message: MESSAGES.USER.PROFILE_UPDATED.message,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, workspaceId } = req.query;
  
      const workspace = workspaceIdSchema.parse(workspaceId);
  
      const profile = await this.userService.getUserProfile(
        username as string,
        workspace as string
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.USER.PROFILE_FETCHED.code,
        message: MESSAGES.USER.PROFILE_FETCHED.message,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  };
}
