import mongoose from "mongoose";
import { TaskLogActionType } from "../../../common/enums/task-log.enum";

export type TaskLogCreateType = {
    taskId: mongoose.Types.ObjectId,
    workspaceId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    action: TaskLogActionType,
    changes: TaskLogChangeType,
}

export type TaskLogChangeType = {
    field: string;
    oldValue: any;
    newValue: any;
}[];
