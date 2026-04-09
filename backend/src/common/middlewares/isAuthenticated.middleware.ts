import { NextFunction, Request, Response } from "express";
import { MESSAGES } from "../constants/message.constant";
import { UnauthorizedException } from "../errors/app-error";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {  
  if (!req.user || !req.user._id) {
    throw new UnauthorizedException(MESSAGES.AUTH.UNAUTHORIZED.message);
  }
  next();
};

export default isAuthenticated;
