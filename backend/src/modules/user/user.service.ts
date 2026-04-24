import { Model, Types } from "mongoose";
import { IUpdateUserProfileInput, UserDocument } from "./interfaces/user.interface";
import { MemberDocument } from "../member/member.model";
import { MESSAGES } from "../../common/constants/message.constant";
import { BadRequestException, NotFoundException } from "../../common/errors/app-error";
import { FileService } from "../file/file.service";
import { toObjectId } from "../../utils/convert-objectId.util";

export class UserService {
  constructor(
    private userModel: Model<UserDocument>,
    private memberModel: Model<MemberDocument>,
    private fileService: FileService
  ) { }

  public async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId)
      .populate("currentWorkspace")
      .select("-password");

    if (!user) throw new BadRequestException(MESSAGES.USER.NOT_FOUND.message);

    return {
      user
    };
  }

  public async updateUserProfile(
    userId: string,
    data: IUpdateUserProfileInput,
    file?: Express.Multer.File
  ) {
    const {
      name, username, phone,
      bio, jobTitle,
      region, weekStartDay,

      workSchedule,
      notifConditions,
      smsConditions
    } = data;

    const updateData: Record<string, any> = {
      ...(name && { name }),
      ...(username && { username }),
      ...(phone && { phone }),
      ...(bio && { bio }),
      ...(jobTitle && { jobTitle }),
      ...(region && { region }),
      ...(weekStartDay !== undefined && { weekStartDay })
    };

    if (workSchedule) {
      updateData.workSchedule = {
        ...(workSchedule.workingDays && { workingDays: workSchedule.workingDays }),
        ...(workSchedule.startHour !== undefined && { startHour: workSchedule.startHour }),
        ...(workSchedule.endHour !== undefined && { endHour: workSchedule.endHour })
      };
    }

    if (notifConditions) {
      updateData.notifConditions = {
        ...(notifConditions.onCreateTask !== undefined && { onCreateTask: notifConditions.onCreateTask }),
        ...(notifConditions.onUpdateTask !== undefined && { onUpdateTask: notifConditions.onUpdateTask }),
        ...(notifConditions.onMention !== undefined && { onMention: notifConditions.onMention }),
        ...(notifConditions.onAutomationAction !== undefined && { onAutomationAction: notifConditions.onAutomationAction }),
        ...(notifConditions.onMessage !== undefined && { onMessage: notifConditions.onMessage })
      };
    }

    if (smsConditions) {
      updateData.smsConditions = {
        ...(smsConditions.onCreateTask !== undefined && { onCreateTask: smsConditions.onCreateTask }),
        ...(smsConditions.onUpdateTask !== undefined && { onUpdateTask: smsConditions.onUpdateTask }),
        ...(smsConditions.onMention !== undefined && { onMention: smsConditions.onMention }),
        ...(smsConditions.onAutomationAction !== undefined && { onAutomationAction: smsConditions.onAutomationAction }),
        ...(smsConditions.onMessage !== undefined && { onMessage: smsConditions.onMessage })
      };
    }

    const user = await this.userModel.findOne({ _id: userId })

    if (file) {
      const attachmentUrl = await this.fileService.upload(file, "profile", toObjectId(userId), user?.currentWorkspace as Types.ObjectId)
      updateData.profilePicture = attachmentUrl;
    }

    const userUpdated = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-password");

    return userUpdated;
  }

  public async getUserProfile(username: string, workspaceId: string) {
    const user = await this.userModel.findOne({ username }, { password: 0 })
      .populate({ path: "currentWorkspace", select: "_id name description" });

    if (!user) throw new NotFoundException(MESSAGES.USER.NOT_FOUND.message);

    const member = await this.memberModel.findOne({
      userId: user._id,
      workspaceId,
    }).populate("role");

    if (!member) throw new NotFoundException(MESSAGES.USER.NOT_IN_WORKSPACE.message);

    return { user };
  }


  public async getUserById(id: string) {
    const user = await this.userModel.findOne({ _id: id }).select("-password");

    if (!user) throw new BadRequestException(MESSAGES.USER.NOT_FOUND.message);

    return user;
  }

  public async incrementStorageUsed(ownerId: Types.ObjectId, size: number) {
    await this.userModel.updateOne(
      { _id: ownerId },
      { $inc: { storageUsed: size } }
    );
  }

  public async decrementStorageUsed(ownerId: Types.ObjectId, size: number) {
    await this.userModel.updateOne(
      { _id: ownerId },
      { $inc: { storageUsed: -size } }
    );
  }
}
