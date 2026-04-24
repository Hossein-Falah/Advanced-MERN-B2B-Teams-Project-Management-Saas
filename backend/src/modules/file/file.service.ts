import { Model, Types } from "mongoose";
import { FileRepository } from "./file.repository";
import { S3Service } from "../aws/aws-s3.service";
import { BadRequestException, NotFoundException } from "../../common/errors/app-error";
import { MESSAGES } from "../../common/constants/message.constant";
import { UserDocument } from "../user/interfaces/user.interface";

export class FileService {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly s3Service: S3Service,
    private readonly userModel: Model<UserDocument>
  ) { };

  public async upload(file: Express.Multer.File, folder: string, userId: Types.ObjectId, workspaceId: Types.ObjectId) {
    const used = await this.fileRepository.getUserStorageUsage(userId);

    const user = await this.userModel.findOne({ _id: userId }).select("-password");

    if (!user) throw new BadRequestException(MESSAGES.USER.NOT_FOUND.message);

    const newSize = used + file.size;

    if (newSize > user.storageLimit) {
      const maxGB = (user.storageLimit / (1024 ** 3)).toFixed(2);
      throw new BadRequestException(`${MESSAGES.FILE.STORAGE_LIMIT_EXCEEDED.message} Maximum allowed: ${maxGB}GB.`);
    }

    const s3Key = await this.s3Service.upload(file, folder);

    const newFile = await this.fileRepository.create({
      owner: userId,
      workspace: workspaceId,
      path: s3Key,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname
    });

    await this.userModel.updateOne(
      { _id: userId },
      { $inc: { storageUsed: file.size } }
    );

    return newFile;
  };

  public async delete(fileId: Types.ObjectId) {
    const file = await this.fileRepository.findById(fileId);
    if (!file) throw new NotFoundException(MESSAGES.FILE.NOT_FOUND.message);

    // remove s3
    await this.s3Service.delete(file.path);

    const { acknowledged, deletedCount } = await this.fileRepository.delete(fileId);

    await this.userModel.updateOne(
      { _id: file.owner },
      { $inc: { storageUsed: -file.size } }
    );

    return { acknowledged, deletedCount };
  };

  public async deleteMany(fileIds: Types.ObjectId[] | string[]) {
    if (!fileIds || fileIds.length === 0) return;

    const ids = fileIds.map(id => new Types.ObjectId(id));

    const files = await this.fileRepository.findByIds(ids);

    if (!files.length) return;

    await Promise.all(
      files.map(file =>
        this.s3Service.delete(file.path)
      )
    );

    const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);

    await this.fileRepository.deleteMany(ids);

    const ownerId = files[0]?.owner;

    if (ownerId) {
      await this.userModel.updateOne(
        { _id: ownerId },
        { $inc: { storageUsed: -totalSize } }
      );
    };
  }

  public async getFileById(fileId: Types.ObjectId) {
    return await this.fileRepository.findById(fileId);
  };

  public async getUserFiles(userId: Types.ObjectId) {
    return await this.fileRepository.findByOwner(userId);
  };
}
