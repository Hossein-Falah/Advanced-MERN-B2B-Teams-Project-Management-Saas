import mongoose, { Schema } from "mongoose";

export interface CommentDocument extends Document {
    content: string;
    task: mongoose.Types.ObjectId;
    workspace: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    attachment: string;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
    {
        content: {
            type: String,
            required: true,
            trim: true,
        },
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
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        attachment: {
            type: String,
            trim: true,
            default: null,
        }
    },
    {
        timestamps: true,
    }
);

const CommentModel = mongoose.model<CommentDocument>("Comment", commentSchema);

commentSchema.path("attachment").get(function (value: string) {
    if (!value) return value;
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const endpoint = process.env.AWS_ENDPOINT;
    return `https://${bucket}.${endpoint}/${value}`;
});

commentSchema.set("toJSON", { getters: true });

export default CommentModel;
