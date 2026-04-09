import { z } from "zod";
import { TaskPriorityEnum, TaskStatusEnum } from "../../common/enums/task.enum";

export const titleSchema = z.string().trim().min(1).max(255);
export const descriptionSchema = z.string().trim().optional();

export const assignedToSchema = z.string().trim().min(1).nullable().optional();

export const prioritySchema = z.enum(
  Object.values(TaskPriorityEnum) as [string, ...string[]]
);

export const statusSchema = z.enum(
  Object.values(TaskStatusEnum) as [string, ...string[]]
);

export const dueDateSchema = z
  .union([z.string(), z.date()])
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      if (val instanceof Date) return !isNaN(val.getTime());
      return !isNaN(Date.parse(val));
    },
    { message: "Invalid date format." }
  )
  .transform((val) => {
    if (!val) return undefined;
    return val instanceof Date ? val : new Date(val);
  });

export const startDateSchema = z
  .union([z.string(), z.date()])
  .optional()
  .refine(
    (val) => {
      if (!val) return true;
      if (val instanceof Date) return !isNaN(val.getTime());
      return !isNaN(Date.parse(val));
    },
    { message: "Invalid date format." }
  )
  .transform((val) => {
    if (!val) return undefined;
    return val instanceof Date ? val : new Date(val);
  });

export const taskIdSchema = z.string().trim().min(1);

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  priority: prioritySchema,
  status: statusSchema,
  assignedTo: assignedToSchema,
  dueDate: dueDateSchema,
  startDate: startDateSchema
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: descriptionSchema,
  priority: z.enum(
    Object.values(TaskPriorityEnum) as [string, ...string[]]
  ).optional(),
  status: z.enum(
    Object.values(TaskStatusEnum) as [string, ...string[]]
  ).optional(),
  assignedTo: assignedToSchema,
  dueDate: dueDateSchema,
  startDate: startDateSchema
});
