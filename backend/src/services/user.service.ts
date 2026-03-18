import UserModel, { UserDocument } from "../models/user.model";
import { BadRequestException } from "../utils/appError";
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
  },
  file?: Express.Multer.File
) => {
  const { name, username, phone } = data;

  const updateData: Record<string, any> = {
    ...(name && { name }),
    ...(username && { username }),
    ...(phone && { phone }),
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
