import MemberModel from "../models/member.model";
import UserModel, { UserDocument } from "../models/user.model";
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
  },
  file?: Express.Multer.File
) => {
  const { name, username, phone, bio, jobTitle } = data;

  const updateData: Record<string, any> = {
    ...(name && { name }),
    ...(username && { username }),
    ...(phone && { phone }),
    ...(bio && { bio }),
    ...(jobTitle && { jobTitle })
  };

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

  const user = await UserModel.findOne({ username })
    .select("name username bio jobTitle profilePicture isOnline lastSeen createdAt -password")
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
