import mongoose, { Schema } from "mongoose";
import { NotificationType, NotificationTypeEnum } from "../../common/enums/notification.enum";

export interface NotificationDocument extends Document {
    type: NotificationType;
    receiver: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    task: mongoose.Types.ObjectId | null;
    comment: mongoose.Types.ObjectId | null;
    workspace: mongoose.Types.ObjectId;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>({
    type: {
        type: String,
        enum: NotificationTypeEnum,
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        default: null
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    workspace: {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const NotificationModel = mongoose.model<NotificationDocument>("Notification", notificationSchema);

export default NotificationModel;
