import mongoose, { Document, Schema } from "mongoose";
import { IntractionType, IntractionTypeEnum } from "../../enums/intraction.enum";

export interface AutomationDocument extends Document {
    type: IntractionType;
    taskId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    daysOfWeek: number[];
    timeOfDay: string;
    timezone: string;
    durationMs: number;
    nextRunAt: Date | null;
    lastRunAt: Date;
    active: boolean;
    workspaceId: mongoose.Types.ObjectId;
}

const automationSchema = new Schema<AutomationDocument>({
    type: {
        type: String,
        enum: IntractionTypeEnum,
        required: true
    },
    taskId: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    daysOfWeek: {
        type: [Number], // [0..6]
        required: true
    },
    timeOfDay: {
        type: String, // "09:00"
        required: true
    },
    durationMs: {
        type: Number,
        required: true
    },
    timezone: {
        type: String,
        default: "Asia/Tehran"
    },
    nextRunAt: {
        type: Date,
        required: false
    },
    lastRunAt: Date,
    active: {
        type: Boolean,
        default: true
    },
    workspaceId: {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    }
}, { timestamps: true });

automationSchema.index({ active: 1, nextRunAt: 1 });

const AutomationModel = mongoose.model<AutomationDocument>("Automation", automationSchema);

export default AutomationModel;
