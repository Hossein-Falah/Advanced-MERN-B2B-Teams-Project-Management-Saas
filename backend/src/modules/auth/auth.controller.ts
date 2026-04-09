import passport from "passport";
import { NextFunction, Request, Response } from "express";

import { AuthService } from "./auth.service";
import { config } from "../../config/app.config";
import { registerSchema } from "./auth.validation";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";

export class AuthController {
  constructor(private authService: AuthService) { }

  googleLoginCallback = async (req: Request, res: Response) => {
    const currentWorkspace = req.user?.currentWorkspace;

    if (!currentWorkspace) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`
      );
    }

    return res.redirect(
      `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
    );
  };

  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = registerSchema.parse({
        ...req.body,
      });      
  
      const { userId, workspaceId } = await this.authService.registerUser(body);
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.CREATED,
        code: MESSAGES.USER.CREATED.code,
        message: MESSAGES.USER.CREATED.message,
        data: { userId, workspaceId },
      });
    } catch (error) {
      next(error);
    }
  };

  login = (req: Request, res: Response, next: NextFunction) => {  
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string } | undefined
      ) => {
        if (err) {
          return next(err);
        }

        if (!user) {
          return ResponseHandler.send(res, {
            success: false,
            statusCode: HTTPSTATUS.UNAUTHORIZED,
            code: MESSAGES.AUTH.INVALID_CREDENTIALS.code,
            message: info?.message || MESSAGES.AUTH.INVALID_CREDENTIALS.message,
            data: null
          });
        }

        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }

          return ResponseHandler.send(res, {
            statusCode: HTTPSTATUS.OK,
            code: MESSAGES.AUTH.LOGIN_SUCCESS.code,
            message: MESSAGES.AUTH.LOGIN_SUCCESS.message,
            data: { user }
          });
        });

      }
    )(req, res, next);
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {

    req.logout((err) => {
      if (err) {
        return next(err);
      }
    });

    req.session = null;

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.AUTH.LOGOUT_SUCCESS.code,
      message: MESSAGES.AUTH.LOGOUT_SUCCESS.message,
      data: null
    });
  };
}
