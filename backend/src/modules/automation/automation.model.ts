import mongoose, { Document, Schema } from "mongoose";
import { IntractionType, IntractionTypeEnum } from "../../enums/intraction.enum";

export interface AutomationDocument extends Document {
    type: IntractionType;
    taskId: mongoose.Types.ObjectId;
    daysOfWeek: number[];
    timeOfDay: string;
    timezone: string;
    nextRunAt: Date | null;
    lastRunAt: Date;
    active: boolean;
    duration?: number;
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
    daysOfWeek: {
        type: [Number], // [0..6]
        required: true
    },
    timeOfDay: {
        type: String, // "09:00"
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
    duration: {
        type: Number,
        require: false
    }
}, { timestamps: true });

automationSchema.index({ nextRunAt: 1 });
automationSchema.index({ active: 1, nextRunAt: 1 });

const AutomationModel = mongoose.model<AutomationDocument>("Automation", automationSchema);

export default AutomationModel;
