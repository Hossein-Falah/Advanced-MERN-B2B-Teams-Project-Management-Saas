import { RequestHandler, Router } from "express";
import uploadMiddelware from "../../common/middlewares/upload.middelware";
import { getContainer } from "../../app/container";

const commentRoutes = Router();

const singleUpload: RequestHandler = uploadMiddelware.single("attachment");

const { commentController } = getContainer()

commentRoutes.post(
  "/task/:taskId/workspace/:workspaceId/create",
  singleUpload,
  commentController.createComment
);

commentRoutes.get("/all/task/:taskId/workspace/:workspaceId", commentController.getAllComments);

commentRoutes.get(
  "/:commentId/task/:taskId/workspace/:workspaceId",
  commentController.getCommentById
);

commentRoutes.put(
  "/:commentId/task/:taskId/workspace/:workspaceId/update",
  singleUpload,
  commentController.updateComment
);

commentRoutes.delete(
  "/:commentId/task/:taskId/workspace/:workspaceId/delete",
  commentController.deleteComment
);



export default commentRoutes;
