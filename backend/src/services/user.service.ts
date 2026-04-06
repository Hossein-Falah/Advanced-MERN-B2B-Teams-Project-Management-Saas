import MemberModel from "../models/member.model";
import UserModel from "../models/user.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { uploadFileToS3 } from "../utils/s3";

export const getCurrentUserService = async (userId: string) => {
  const user = await UserModel.findById(userId)
    .populate("currentWorkspace")
    .select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  return {
    user,
  };
};

export const updateUserProfileService = async (
  userId: string,
  data: {
    name?: string;
    username?: string;
    phone?: string;
    bio?: string;
    jobTitle?: string

    region?: string;
    weekStartDay?: number;

    workSchedule?: {
      workingDays?: number[];
      startHour?: number;
      endHour?: number;
    };

    notifConditions?: {
      onCreateTask?: boolean;
      onUpdateTask?: boolean;
      onMention?: boolean;
      onAutomationAction?: boolean;
      onMessage?: boolean;
    };

    smsConditions?: {
      onCreateTask?: boolean;
      onUpdateTask?: boolean;
      onMention?: boolean;
      onAutomationAction?: boolean;
      onMessage?: boolean;
    };
  },
  file?: Express.Multer.File
) => {
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

  if (file) {
    const attachmentUrl = await uploadFileToS3(file, "profile");
    updateData.profilePicture = attachmentUrl;
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true }
  ).select("-password");

  return user;
};

export const getUserProfileService = async (
  username: string,
  workspaceId: string
) => {

  const user = await UserModel.findOne({ username }, { password: 0 })
    .populate({ path: "currentWorkspace", select: "_id name description" });

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const member = await MemberModel.findOne({
    userId: user._id,
    workspaceId,
  }).populate("role");

  if (!member) {
    throw new NotFoundException("User not in this workspace");
  }

  return {
    user
  };
};

export const getUserById = async (id: string) => {
  const user = await UserModel.findOne({ _id: id }).select("-password");

  if (!user) {
    throw new BadRequestException("User not found");
  }

  return user
}
