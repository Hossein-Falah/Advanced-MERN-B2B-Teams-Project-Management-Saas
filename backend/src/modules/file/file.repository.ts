import { Model, Types } from "mongoose";
import FileModel, { FileDocument } from "./file.model";

export class FileRepository {
    constructor(
        private fileModel: Model<FileDocument>
    ) { };

    public async create(file: Partial<FileDocument>) {
        return this.fileModel.create(file);
    }

    public async findById(id: Types.ObjectId) {
        return this.fileModel.findById(id);
    }

    public async findByOwner(ownerId: Types.ObjectId) {
        return this.fileModel.find({ owner: ownerId });
    }

    public async getUserStorageUsage(userId: Types.ObjectId) {
        const result = await this.fileModel.aggregate([
            { $match: { owner: userId } },
            { $group: { _id: null, total: { $sum: "$size" } } }
        ]);

        return result[0]?.total || 0;
    };

    public async delete(fileId: Types.ObjectId) {
        return await this.fileModel.deleteOne({ _id: fileId });
    };

    public async findByIds(ids: Types.ObjectId[]) {
        return this.fileModel.find({
            _id: { $in: ids }
        });
    };

    public async deleteMany(ids: Types.ObjectId[]) {
        return this.fileModel.deleteMany({
            _id: { $in: ids }
        });
    };
}

export const fileRepository = new FileRepository(FileModel);
