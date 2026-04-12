import { z } from "zod";
import { memberIdSchema, roleIdSchema } from "../../common/validator/common.validator";

export const nameSchema = z
  .string()
  .trim()
  .min(1, { message: "Name is required" })
  .max(255);

export const descriptionSchema = z.string().trim().optional();

export const changeRoleSchema = z.object({
  roleId: roleIdSchema,
  memberId: memberIdSchema
});

export const createWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const updateWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});
