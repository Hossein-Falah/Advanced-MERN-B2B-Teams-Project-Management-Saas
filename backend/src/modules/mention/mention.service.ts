import { Types } from "mongoose";
import UserModel from "../../models/user.model";
import { NotificationTypeEnum } from "../../enums/notification.enum";
import { NotificationService } from "../notification/notification.service";
import { toObjectId } from "../../utils/convert-objectId.util";
import { io } from "../../socket";

export class MentionService {
    static extractMentions(content: string): string[] {
        const regex = /@(\w+)/g;
        const matches = content.match(regex);

        if (!matches) return [];

        return [...new Set(matches.map(m => m.slice(1)))];
    }

    static async handleMentions(
        content: string,
        senderId: Types.ObjectId,
        taskId: Types.ObjectId,
        commentId: Types.ObjectId,
        workspace: Types.ObjectId
    ) {

        const usernames = this.extractMentions(content);

        if (!usernames.length) return;

        const users = await UserModel.find({
            username: { $in: usernames },
            _id: { $ne: senderId }
        });

        for (const user of users) {
            const notification = await NotificationService.create({
                type: NotificationTypeEnum.MENTION,
                receiver: toObjectId(user._id as Types.ObjectId),
                sender: toObjectId(senderId),
                task: toObjectId(taskId),
                comment: toObjectId(commentId),
                workspace: toObjectId(workspace)
            });

            io.to(`user:${user._id}`).emit("notification:new", notification);
        }
    }

    static async searchUsers(workspace: string, query: string) {
        if (!query) return [];

        const users = await UserModel.find({
            currentWorkspace: workspace,
            username: { $regex: `^${query}`, $options: "i" }
        })
        .select("_id username avatar -password")
        .limit(10);

        return users;
    }
}
