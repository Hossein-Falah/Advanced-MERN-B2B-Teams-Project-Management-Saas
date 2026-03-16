import { RequestHandler, Router } from "express";

import uploadMiddelware from "../middlewares/upload.middelware";
import { 
  createCommentController, 
  deleteCommentController, 
  getAllCommentController, 
  getCommentByIdController, 
  updateCommentController
 } from "../controllers/comment.controller";

const commentRoutes = Router();

const singleUpload: RequestHandler = uploadMiddelware.single("attachment");

commentRoutes.post(
  "/task/:taskId/workspace/:workspaceId/create",
  singleUpload,
  createCommentController
);

commentRoutes.get("/all/task/:taskId/workspace/:workspaceId", getAllCommentController);

commentRoutes.get(
  "/:commentId/task/:taskId/workspace/:workspaceId",
  getCommentByIdController
);

commentRoutes.put(
  "/:commentId/task/:taskId/workspace/:workspaceId/update",
  singleUpload,
  updateCommentController
);

commentRoutes.delete(
  "/:commentId/task/:taskId/workspace/:workspaceId/delete",
  deleteCommentController
);



export default commentRoutes;
