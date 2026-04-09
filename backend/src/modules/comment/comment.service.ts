import { Model } from "mongoose";
import { CommentDocument } from "./comment.model";
import { TaskDocument } from "../task/task.model";
import { MESSAGES } from "../../common/constants/message.constant";
import { toObjectId } from "../../utils/convert-objectId.util";
import { deleteFile, uploadFileToS3 } from "../../utils/s3";
import { MentionService } from "../mention/mention.service";
import { BadRequestException, NotFoundException } from "../../common/errors/app-error";

export class CommentService {
    constructor(
        private readonly mentionService: MentionService,
        private taskModel: Model<TaskDocument>,
        private commentModel: Model<CommentDocument>,
    ) { }

    async createComment(
        workspaceId: string,
        taskId: string,
        userId: string,
        body: { content: string },
        attachment?: string
    ) {

        const task = await this.taskModel.findById(taskId);

        if (!task || task.workspace.toString() !== workspaceId) {
            throw new NotFoundException(
                MESSAGES.TASK.NOT_FOUND.message
            );
        }

        const comment = await this.commentModel.create({
            content: body.content,
            user: userId,
            workspace: workspaceId,
            attachment,
            task: taskId,
        });

        await this.mentionService.handleMentions(
            body.content,
            toObjectId(userId),
            toObjectId(taskId),
            comment._id,
            toObjectId(workspaceId)
        );

        return comment;
    }

    async deleteComment(
        workspaceId: string,
        commentId: string,
        taskId: string
    ) {

        const comment = await this.commentModel.findOneAndDelete({
            _id: commentId,
            task: taskId,
            workspace: workspaceId,
        });

        if (!comment) {
            throw new NotFoundException(
                MESSAGES.COMMENT.COMMENT_NOT_FOUND.message
            );
        }

        if (comment.attachment) {
            await deleteFile(comment.attachment);
        }
    }

    async updateComment(
        workspaceId: string,
        commentId: string,
        taskId: string,
        body: { content: string },
        file?: Express.Multer.File
    ) {

        const comment = await this.commentModel.findById(commentId);

        if (!comment) {
            throw new NotFoundException(
                MESSAGES.COMMENT.COMMENT_NOT_FOUND.message,
            );
        }

        const task = await this.taskModel.findById(taskId);

        if (!task || task.workspace.toString() !== workspaceId) {
            throw new NotFoundException(
                MESSAGES.TASK.NOT_FOUND.message
            );
        }

        let attachmentUrl: string | undefined;

        if (file) {
            if (comment.attachment) {
                await deleteFile(comment.attachment);
            }

            attachmentUrl = await uploadFileToS3(file, "comment/attachment");
        }

        const updated = await this.commentModel.findByIdAndUpdate(
            commentId,
            {
                content: body.content,
                attachment: attachmentUrl ?? comment.attachment,
            },
            { new: true }
        );

        if (!updated) {
            throw new BadRequestException(
                MESSAGES.COMMENT.UPDATE_FAILED.message
            );
        }

        return updated;
    }

    async getAllComments(
        workspaceId: string,
        taskId: string,
        pagination: { pageSize: number; pageNumber: number }
    ) {

        const { pageSize, pageNumber } = pagination;
        const skip = (pageNumber - 1) * pageSize;

        const query = {
            workspace: workspaceId,
            task: taskId,
        };

        const [comments, totalCount] = await Promise.all([
            this.commentModel.find(query)
                .skip(skip)
                .limit(pageSize)
                .sort({ createdAt: -1 })
                .populate({
                    path: "user",
                    select:
                        "_id name email profilePicture isActive lastLogin currentWorkspace -password",
                }),

            this.commentModel.countDocuments(query),
        ]);

        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            comments,
            pagination: {
                pageSize,
                pageNumber,
                totalCount,
                totalPages,
            },
        };
    }

    async getCommentById(
        workspaceId: string,
        taskId: string,
        commentId: string
    ) {

        const comment = await this.commentModel.findOne({
            _id: commentId,
            workspace: workspaceId,
            task: taskId,
        }).populate({
            path: "user",
            select:
                "_id name email profilePicture isActive lastLogin currentWorkspace -password",
        });

        if (!comment) {
            throw new NotFoundException(
                MESSAGES.COMMENT.COMMENT_NOT_FOUND.message
            );
        }

        return comment;
    }
}
