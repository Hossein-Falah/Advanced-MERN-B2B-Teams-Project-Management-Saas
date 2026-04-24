import mongoose, { Document, Schema } from "mongoose";

export interface FileDocument extends Document {
    owner: mongoose.Types.ObjectId;
    workspace: mongoose.Types.ObjectId;

    path: string; // route store file  (local, S3, CDN)
    size: number; // calculate file bite
    mimeType: string;
    originalName: string;

    createdAt: Date;
}

const fileSchema = new Schema<FileDocument>(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },

        path: { type: String, required: true },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true },
        originalName: { type: String, required: true },

        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const FileModel = mongoose.model<FileDocument>("File", fileSchema);


fileSchema.path("path").get(function (value: string) {
    if (!value) return value;
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const endpoint = process.env.AWS_ENDPOINT;
    return `https://${bucket}.${endpoint}/${value}`;
});

fileSchema.set("toJSON", { getters: true });


export default FileModel;
