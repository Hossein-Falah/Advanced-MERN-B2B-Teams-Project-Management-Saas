import mongoose from "mongoose";

export interface WorkSchedule {
    workingDays: number[];
    startHour: number;
    endHour: number;
}

export interface NotificationConditions {
    onCreateTask: boolean;
    onUpdateTask: boolean;
    onMention: boolean;
    onAutomationAction: boolean;
    onMessage: boolean;
}

export interface SmsConditions {
    onCreateTask: boolean;
    onUpdateTask: boolean;
    onMention: boolean;
    onAutomationAction: boolean;
    onMessage: boolean;
}

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
    isOnline?: boolean;
    lastSeen?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    currentWorkspace: mongoose.Types.ObjectId | null;

    region?: string;
    weekStartDay?: number;
    workSchedule?: WorkSchedule;
    notifConditions?: NotificationConditions;
    smsConditions?: SmsConditions;

    comparePassword(value: string): Promise<boolean>;
    omitPassword(): Omit<UserDocument, "password">;
}
