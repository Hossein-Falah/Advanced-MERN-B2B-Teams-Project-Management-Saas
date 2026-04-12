import { Model, Types } from "mongoose";
import { UserDocument } from "../user/interfaces/user.interface";
import { ICreateWorkspaceInput } from "./interface/workspace.interface";
import { MESSAGES } from "../../common/constants/message.constant";
import { RoleDocument } from "../auth/schema/roles-permission.model";
import { WorkspaceDocument } from "./workspace.model";
import { MemberDocument } from "../member/member.model";
import { Roles } from "../../common/enums/role.enum";
import { TaskStatusEnum } from "../../common/enums/task.enum";
import { toObjectId } from "../../utils/convert-objectId.util";
import { ProjectDocument } from "../project/project.model";
import { TaskDocument } from "../task/task.model";
import { BadRequestException, NotFoundException } from "../../common/errors/app-error";
import { PaginationFilter } from "../../common/types/pagination.type";

export class WorkspaceService {
  constructor(
    private userModel: Model<UserDocument>,
    private roleModel: Model<RoleDocument>,
    private workspaceModel: Model<WorkspaceDocument>,
    private memberModel: Model<MemberDocument>,
    private projectModel: Model<ProjectDocument>,
    private taskModel: Model<TaskDocument>
  ) { }
  // CREATE WORKSPACE

  public async createWorkspace(
    userId: string,
    body: ICreateWorkspaceInput
  ) {
    const { name, description } = body;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND.message);
    }

    const ownerRole = await this.roleModel.findOne({ name: Roles.OWNER });
    if (!ownerRole) {
      throw new NotFoundException(MESSAGES.WORKSPACE.OWNER_ROLE_NOT_FOUND.message);
    }

    const workspace = new this.workspaceModel({
      name,
      description,
      owner: user._id,
    });

    await workspace.save();

    const member = new this.memberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    });

    await member.save();

    user.currentWorkspace = workspace._id as Types.ObjectId;
    await user.save();

    return { workspace };
  }

  // GET USER WORKSPACES
  public async getAllWorkspacesUserIsMember({ page, limit }: PaginationFilter, userId: string) {
    const skip = (page - 1) * limit;

    const [memberships, totalCount] = await Promise.all([
      this.memberModel.find({ userId })
        .populate("workspaceId")
        .select("-password")
        .skip(skip)
        .limit(limit),
      this.memberModel.countDocuments({ userId })
    ])

    const workspaces = memberships.map(
      (membership) => membership.workspaceId
    );

    return {
      workspaces,
      pagination: {
        page,
        limit,
        totalCount
      }
    };
  }

  // GET WORKSPACE BY ID
  public async getWorkspaceById(workspaceId: string) {
    const workspace = await this.workspaceModel.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException(MESSAGES.WORKSPACE.WORKSPACE_NOT_FOUND.message);
    }

    const members = await this.memberModel.find({ workspaceId }).populate("role");

    const workspaceWithMembers = {
      ...workspace.toObject(),
      members,
    };

    return { workspace: workspaceWithMembers };
  }

  // GET WORKSPACE MEMBERS
  public async getWorkspaceMembers({ page, limit }: PaginationFilter, workspaceId: string) {
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.memberModel.find({ workspaceId })
        .populate("userId", { password: 0 })
        .populate("role", "name")
        .skip(skip)
        .limit(limit),
      this.memberModel.countDocuments({ workspaceId })
    ])

    const roles = await this.roleModel.find({}, { name: 1, _id: 1 })
      .select("-permission")
      .lean();

    return { 
      members, 
      roles,
      pagination: {
        page,
        limit,
        total
      }
    };
  }

  // WORKSPACE ANALYTICS
  public async getWorkspaceAnalytics(workspaceId: string) {
    const currentDate = new Date();

    const totalTasks = await this.taskModel.countDocuments({
      workspace: workspaceId,
    });

    const overdueTasks = await this.taskModel.countDocuments({
      workspace: workspaceId,
      dueDate: { $lt: currentDate },
      status: { $ne: TaskStatusEnum.DONE },
    });

    const completedTasks = await this.taskModel.countDocuments({
      workspace: workspaceId,
      status: TaskStatusEnum.DONE,
    });

    return {
      analytics: {
        totalTasks,
        overdueTasks,
        completedTasks,
      },
    };
  }

  // CHANGE MEMBER ROLE
  public async changeMemberRole(
    workspaceId: string,
    memberId: string,
    roleId: string
  ) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException(MESSAGES.WORKSPACE.WORKSPACE_NOT_FOUND.message);
    }

    const role = await this.roleModel.findById(roleId);
    if (!role) {
      throw new NotFoundException(MESSAGES.WORKSPACE.ROLE_NOT_FOUND.message);
    }

    const member = await this.memberModel.findOne({
      userId: memberId,
      workspaceId,
    });

    if (!member) {
      throw new NotFoundException(MESSAGES.WORKSPACE.MEMBER_NOT_FOUND.message);
    }

    member.role = role;
    await member.save();

    return { member };
  }

  // UPDATE WORKSPACE
  public async updateWorkspaceById(
    workspaceId: string,
    name: string,
    description?: string
  ) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException(MESSAGES.WORKSPACE.WORKSPACE_NOT_FOUND.message);
    }

    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    await workspace.save();

    return { workspace };
  }

  // DELETE WORKSPACE
  public async deleteWorkspace(
    workspaceId: string,
    userId: string
  ) {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException(MESSAGES.WORKSPACE.WORKSPACE_NOT_FOUND.message);
    }

    if (!workspace.owner.equals(toObjectId(userId))) {
      throw new BadRequestException(
        MESSAGES.WORKSPACE.NOT_AUTHORIZED_DELETE.message
      );
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(MESSAGES.USER.NOT_FOUND.message);
    }

    await this.projectModel.deleteMany({ workspace: workspace._id });
    await this.taskModel.deleteMany({ workspace: workspace._id });
    await this.memberModel.deleteMany({ workspaceId: workspace._id });

    if (user.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await this.memberModel.findOne({ userId });
      user.currentWorkspace = memberWorkspace
        ? memberWorkspace.workspaceId
        : null;
      await user.save();
    }

    await workspace.deleteOne();

    return {
      currentWorkspace: user.currentWorkspace,
    };
  }
}
