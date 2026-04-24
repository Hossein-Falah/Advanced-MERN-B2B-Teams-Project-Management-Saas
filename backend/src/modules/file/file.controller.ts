import { Request, Response, NextFunction } from "express";
import { FileService } from "./file.service";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";

export class FileController {
  constructor(private fileService: FileService) { }

  getFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;

      const files = await this.fileService.getUserFiles(userId);

      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.FILE.FETCHED.code,
        message: MESSAGES.FILE.FETCHED.message,
        data: { files }
      });
    } catch (error) {
      next(error);
    }
  };
}
