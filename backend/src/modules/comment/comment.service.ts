import { Model, Types } from "mongoose";
import { CommentDocument } from "./comment.model";
import { TaskDocument } from "../task/task.model";
import { MESSAGES } from "../../common/constants/message.constant";
import { toObjectId } from "../../utils/convert-objectId.util";
import { MentionService } from "../mention/mention.service";
import { BadRequestException, NotFoundException } from "../../common/errors/app-error";
import { PaginationFilter } from "../../common/types/pagination.type";
import { FileService } from "../file/file.service";
import { FileDocument } from "../file/file.model";

export class CommentService {
    constructor(
        private readonly mentionService: MentionService,
        private readonly fileService: FileService,
        private taskModel: Model<TaskDocument>,
        private commentModel: Model<CommentDocument>
    ) { }

    async createComment(
        workspaceId: string,
        taskId: string,
        userId: string,
        body: { content: string },
        attachments?: Express.Multer.File[]
    ) {
        const task = await this.taskModel.findById(taskId);

        if (!task || task.workspace.toString() !== workspaceId) {
            throw new NotFoundException(
                MESSAGES.TASK.NOT_FOUND.message
            );
        }

        let attachmentIds: Types.ObjectId[] = [];

        if (attachments && attachments.length > 0) {
            const uploadedFiles = await Promise.all(
                attachments.map((file) =>
                    this.fileService.upload(
                        file,
                        "task/attachment",
                        toObjectId(userId),
                        toObjectId(workspaceId)
                    )
                )
            );

            attachmentIds = uploadedFiles.map((f) => f._id);
        };

        const comment = await this.commentModel.create({
            content: body.content,
            user: userId,
            workspace: workspaceId,
            attachment: attachmentIds,
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

        if (comment.attachment && comment.attachment.length > 0) {
            await Promise.all(
                comment.attachment.map((fileId: Types.ObjectId) =>
                    this.fileService.delete(fileId)
                )
            );
        }

        return comment
    }

    async updateComment(
        userId: string,
        workspaceId: string,
        commentId: string,
        taskId: string,
        body: { content: string, removeAttachmentIds?: string[] },
        files?: Express.Multer.File[]
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

        let attachments = [...comment.attachment];

        if (body.removeAttachmentIds?.length) {
            await this.fileService.deleteMany(body.removeAttachmentIds);

            attachments = attachments.filter(
                id => !body.removeAttachmentIds?.includes(id.toString())
            );
        }

        let attachmentUrl: FileDocument | null = null;

        if (files?.length) {
            const uploaded = await Promise.all(
                files.map(file =>
                    this.fileService.upload(
                        file,
                        "comment/attachment",
                        toObjectId(userId),
                        toObjectId(workspaceId)
                    )
                )
            );

            attachments.push(...uploaded.map(f => f._id));
        }

        comment.attachment = attachments;

        await comment.save();

        const updated = await this.commentModel.findByIdAndUpdate(
            commentId,
            {
                content: body.content,
                ...(attachmentUrl ? { attachment: attachments } : {}),
            },
            { new: true }
        );

        if (!updated) {
            throw new BadRequestException(
                MESSAGES.COMMENT.UPDATE_FAILED.message
            );
        }

        return { comment: updated };
    }

    async getAllComments(
        workspaceId: string,
        taskId: string,
        pagination: PaginationFilter
    ) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const query = {
            workspace: workspaceId,
            task: taskId,
        };

        const [comments, totalCount] = await Promise.all([
            this.commentModel.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .populate({
                    path: "user",
                    select: "_id name email profilePicture isActive lastLogin currentWorkspace -password",
                })
                .populate("attachment"),

            this.commentModel.countDocuments(query),
        ]);

        return {
            comments,
            pagination: {
                page,
                limit,
                totalCount
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
        }).populate("attachment");

        if (!comment) {
            throw new NotFoundException(
                MESSAGES.COMMENT.COMMENT_NOT_FOUND.message
            );
        }

        return comment;
    }
}
