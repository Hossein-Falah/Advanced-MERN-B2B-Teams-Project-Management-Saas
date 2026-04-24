import { RequestHandler, Router } from "express";
import uploadMiddelware from "../../common/middlewares/upload.middelware";
import { getContainer } from "../../app/container";

const commentRoutes = Router();

const multipleUpload: RequestHandler = uploadMiddelware.array("attachment", 10);

const { commentController } = getContainer()

commentRoutes.post(
  "/task/:taskId/workspace/:workspaceId/create",
  multipleUpload,
  commentController.createComment
);

commentRoutes.get("/all/task/:taskId/workspace/:workspaceId", commentController.getAllComments);

commentRoutes.get(
  "/:commentId/task/:taskId/workspace/:workspaceId",
  commentController.getCommentById
);

commentRoutes.put(
  "/:commentId/task/:taskId/workspace/:workspaceId/update",
  multipleUpload,
  commentController.updateComment
);

commentRoutes.delete(
  "/:commentId/task/:taskId/workspace/:workspaceId/delete",
  commentController.deleteComment
);

export default commentRoutes;
