import { Types } from "mongoose";
import UserModel from "../../models/user.model";
import { NotificationTypeEnum } from "../../enums/notification.enum";
import { NotificationService } from "../notification/notification.service";
import { toObjectId } from "../../utils/convert-objectId.util";

export class MentionService {
    static extractMentions(content: string): string[] {
        const regex = /@([a-zA-Z0-9_-]+)/g;

        const matches = [...content.matchAll(regex)];

        if (!matches.length) return [];

        return [...new Set(matches.map(m => m[1]))];
    }

    static async handleMentions(
        content: string,
        senderId: Types.ObjectId,
        taskId: Types.ObjectId,
        commentId: Types.ObjectId,
        workspace: Types.ObjectId
    ) {
        const usernames = [...new Set(this.extractMentions(content))];

        if (!usernames.length) return;

        const users = await UserModel.find({
            username: { $in: usernames },
            currentWorkspace: workspace,
            _id: senderId
        });
        
        await Promise.all(
            users.map(async user => 
                await NotificationService.create({
                    type: NotificationTypeEnum.MENTION,
                    receiver: toObjectId(user._id as Types.ObjectId),
                    sender: toObjectId(senderId),
                    task: toObjectId(taskId),
                    comment: toObjectId(commentId),
                    workspace: toObjectId(workspace)
                })
            )
        );
    }

    static async getMentionUsers(workspace: string, query: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const filter: any = {
            currentWorkspace: toObjectId(workspace)
        };

        if (query && query.trim() !== "") {
            filter.username = {
                $regex: `^${query}`,
                $options: "i"
            };
        }

        const users = await UserModel.find(filter)
            .select("_id username avatar -password")
            .skip(skip)
            .limit(limit);

        const total = await UserModel.countDocuments(filter);

        return {
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        };
    }
}
