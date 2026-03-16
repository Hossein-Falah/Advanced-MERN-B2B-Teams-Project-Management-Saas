import mongoose, { Schema } from "mongoose";
import { TaskLogActionEnumType, TaskLogActionType } from "../enums/task-log.enum";

export type TaskLogChangeType = {
    field: string;
    oldValue: any;
    newValue: any;
}[];

export interface TaskLogDocument extends Document {
    task: mongoose.Types.ObjectId;
    workspace: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    action: TaskLogActionType;
    changes: TaskLogChangeType;
    createdAt: Date;
}

const taskLogSchema = new Schema<TaskLogDocument>(
    {
        task: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true,
            index: true,
        },
        workspace: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        action: {
            type: String,
            enum: TaskLogActionEnumType,
            required: true,
        },
        changes: [
            {
                field: String,
                oldValue: Schema.Types.Mixed,
                newValue: Schema.Types.Mixed,
            },
        ],
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);


const TaskLogModel = mongoose.model<TaskLogDocument>("TaskLog", taskLogSchema);

export default TaskLogModel;
