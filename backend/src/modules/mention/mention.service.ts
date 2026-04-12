import { Model, Types } from "mongoose";
import { NotificationTypeEnum } from "../../common/enums/notification.enum";
import { NotificationService } from "../notification/notification.service";
import { toObjectId } from "../../utils/convert-objectId.util";
import { UserDocument } from "../user/interfaces/user.interface";
import { MemberDocument } from "../member/member.model";
import { PaginationFilter } from "../../common/types/pagination.type";

export class MentionService {
    constructor(
        private userModel: Model<UserDocument>,
        private memberModel: Model<MemberDocument>,
        private notificationService: NotificationService
    ) { }

    private extractMentions(content: string): string[] {
        const regex = /@([a-zA-Z0-9_-]+)/g;

        const matches = [...content.matchAll(regex)];

        if (!matches.length) return [];

        return [...new Set(matches.map(m => m[1]))];
    }

    public async handleMentions(
        content: string,
        senderId: Types.ObjectId,
        taskId: Types.ObjectId,
        commentId: Types.ObjectId,
        workspace: Types.ObjectId
    ) {
        const usernames = [...new Set(this.extractMentions(content))];

        if (!usernames.length) return;

        const users = await this.userModel.find({
            username: { $in: usernames },
            currentWorkspace: workspace,
            _id: senderId
        });

        await Promise.all(
            users.map(async user =>
                await this.notificationService.create({
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

    public async getMentionUsers({ page = 1, limit = 10 }: PaginationFilter, workspace: string, query: string) {
        const skip = (page - 1) * limit;

        const members = await this.memberModel.find({
            workspaceId: toObjectId(workspace)
        })
            .populate("userId", { password: 0 });

        const userIds = members.map(m => m.userId);        

        if (userIds.length === 0) {
            return {
                users: [],
                pagination: {
                    page,
                    limit,
                    total: 0
                }
            };
        }

        const filter: any = {
            _id: { $in: userIds }
        };

        if (query && query.trim() !== "") {
            filter.username = {
                $regex: `^${query}`,
                $options: "i"
            };
        }

        const users = await this.userModel.find(filter)
            .select("_id username avatar -password")
            .skip(skip)
            .limit(limit);

        const total = await this.userModel.countDocuments(filter);

        return {
            users,
            pagination: {
                page,
                limit,
                total
            },
        };
    }
}
