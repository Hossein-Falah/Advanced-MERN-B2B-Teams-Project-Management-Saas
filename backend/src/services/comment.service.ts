import { Types } from "mongoose";
import { BadRequestException, NotFoundException } from "../utils/appError";
import CommentModel from "../models/comment.model";
import TaskModel from "../models/task.model";
import { deleteFile, uploadFileToS3 } from "../utils/s3";
import { toObjectId } from "../utils/convert-objectId.util";
import { MentionService } from "../modules/mention/mention.service";

export const createCommentService = async (
    workspace: string,
    taskId: string,
    userId: string,
    body: {
        content: string;
    },
    attachment: string | undefined
) => {
    const { content } = body;

    const task = await TaskModel.findById(taskId);

    if (!task || task.workspace.toString() !== workspace.toString()) {
        throw new NotFoundException(
            "task not found or does not belong to this workspace"
        );
    }

    const comment = new CommentModel({
        content,
        userId,
        workspace,
        attachment,
        task: taskId
    });

    await comment.save();

    await MentionService.handleMentions(
        content,
        toObjectId(userId),
        toObjectId(task._id as Types.ObjectId),
        comment._id,
        toObjectId(workspace)
    );

    return { comment };
};


export const deleteCommentService = async (workspaceId: string, commentId: string, taskId: string) => {
    const comment = await CommentModel.findOneAndDelete({
        _id: commentId,
        task: taskId,
        workspace: workspaceId
    });

    if (comment?.attachment) await deleteFile(comment.attachment);

    if (!comment) {
        throw new NotFoundException(
            "comment not found or does not belong to the specified task"
        );
    }
}

export const updateCommentService = async (
    workspaceId: string,
    commentId: string,
    taskId: string,
    body: {
        content: string;
    },
    file?: Express.Multer.File | undefined
) => {
    const comment = await CommentModel.findById(commentId);

    if (!comment) throw new NotFoundException("comment notfound");

    const task = await TaskModel.findById(taskId);

    if (!task || task.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "task not found or does not belong to this workspace"
        );
    }

    let attachmentUrl: string | undefined;

    if (file && comment?.attachment) {
        await deleteFile(comment?.attachment);
        attachmentUrl = await uploadFileToS3(file, "comment/attachment");
    }

    const updateComment = await CommentModel.findByIdAndUpdate(
        commentId,
        {
            ...body,
            attachment: attachmentUrl
        },
        { new: true }
    )

    if (!updateComment) throw new BadRequestException("Failed to update comment");

    return { updateComment };
}

export const getAllCommentService = async (
    workspaceId: string,
    taskId: string,
    pagination: {
        pageSize: number;
        pageNumber: number;
    }
) => {
    const query: Record<string, any> = {
        workspace: workspaceId,
        task: taskId
    };

    //Pagination Setup
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const [comments, totalCount] = await Promise.all([
        CommentModel.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "_id name email profilePicture isActive lastLogin currentWorkspace -password"
            }),
        CommentModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        comments,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
};

export const getCommentByIdService = async (
    workspaceId: string,
    commentId: string,
    taskId: string
) => {
    const task = await TaskModel.findById(taskId);

    if (!task || task.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "task not found or does not belong to this workspace"
        );
    }

    const comment = await CommentModel.findOne({
        _id: commentId,
        workspace: workspaceId,
        task: taskId,
    })
        .populate({
            path: "user",
            select: "_id name email profilePicture isActive lastLogin currentWorkspace -password"
        })

    if (!comment) throw new NotFoundException("Comment not found.");

    return comment;
}
