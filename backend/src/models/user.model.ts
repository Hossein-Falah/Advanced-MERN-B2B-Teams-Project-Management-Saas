import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  profilePicture: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  username?: string;
  phone?: string;
  bio?: string;
  jobTitle?: string;
  isOnline?: string | null;
  lastSeen?: string | null;
  createdAt: Date;
  updatedAt: Date;
  currentWorkspace: mongoose.Types.ObjectId | null;
  comparePassword(value: string): Promise<boolean>;
  omitPassword(): Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      required: false,
      unique: true,
      trim: true
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      trim: true
    },
    password: { type: String, select: true },
    bio: {
      type: String,
      required: false,
      default: null,
    },
    jobTitle: {
      type: String,
      required: false,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    currentWorkspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    if (this.password) {
      this.password = await hashValue(this.password);
    }
  }
  next();
});

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

userSchema.methods.comparePassword = async function (value: string) {
  return compareValue(value, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);

userSchema.path("profilePicture").get(function (value: string) {
  if (!value) return value;
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const endpoint = process.env.AWS_ENDPOINT;
  return `https://${bucket}.${endpoint}/${value}`;
});

userSchema.set("toJSON", { getters: true });

export default UserModel;
