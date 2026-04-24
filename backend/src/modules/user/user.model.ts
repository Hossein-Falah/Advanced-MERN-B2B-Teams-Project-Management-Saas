import mongoose, { Schema } from "mongoose";
import { UserDocument } from "./interfaces/user.interface";
import { compareValue, hashValue } from "../../utils/bcrypt";

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
    storageUsed: { type: Number, default: 0 },
    storageLimit: { type: Number, required: true, default: 5 * 1024 ** 3 },
    region: {
      type: String,
      default: "Asia/Tehran"
    },
    weekStartDay: {
      type: Number,
      default: 1
    },
    workSchedule: {
      workingDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5]
      },
      startHour: {
        type: Number,
        default: 9,
        min: 0,
        max: 23
      },
      endHour: {
        type: Number,
        default: 18,
        min: 0,
        max: 23
      }
    },
    notifConditions: {
      onCreateTask: { type: Boolean, default: true },
      onUpdateTask: { type: Boolean, default: true },
      onMention: { type: Boolean, default: true },
      onAutomationAction: { type: Boolean, default: true },
      onMessage: { type: Boolean, default: true }
    },
    smsConditions: {
      onCreateTask: { type: Boolean, default: false },
      onUpdateTask: { type: Boolean, default: false },
      onMention: { type: Boolean, default: false },
      onAutomationAction: { type: Boolean, default: false },
      onMessage: { type: Boolean, default: false }
    }
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
userSchema.set("toObject", { getters: true });

export default UserModel;
