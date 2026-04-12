import z from "zod";

export const objectIdValidator = (field: string) =>
    z
      .string({
        required_error: `${field} is required`,
        invalid_type_error: `${field} must be a string`,
      })
      .regex(/^[0-9a-fA-F]{24}$/, `${field} is not a valid ObjectId`);


export const taskIdSchema = objectIdValidator("taskId");

export const workspaceIdSchema = objectIdValidator("workspaceId");

export const commentIdSchema = objectIdValidator("commentId")

export const projectIdSchema = objectIdValidator("projectId");

export const userIdSchema = objectIdValidator("userId");

export const logIdSchema = objectIdValidator("logId");

export const automationIdSchema = objectIdValidator("automationId");

export const roleIdSchema = objectIdValidator("roleId");

export const memberIdSchema = objectIdValidator("memberId");

export const notificationIdSchema = objectIdValidator("notificationId")
