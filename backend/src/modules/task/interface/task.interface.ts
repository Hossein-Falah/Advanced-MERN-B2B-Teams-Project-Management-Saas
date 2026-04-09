import { Types } from "mongoose";

export interface CreateTaskInput {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null | Types.ObjectId;
    startDate?: Date | null;
    dueDate?: Date | null;
}

export interface UpdateTaskInput {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedTo?: string | null;
    startDate?: Date | null;
    dueDate?: Date | null;
}

export interface TaskFilters {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    taskId?: string;
    keyword?: string;
    dueDate?: Date | string;
}

export interface TaskPagination {
    page: number;
    limit: number;
}
