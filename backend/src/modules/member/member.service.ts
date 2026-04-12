import { Model } from "mongoose";
import { MemberDocument } from "./member.model";
import { WorkspaceDocument } from "../workspace/workspace.model";
import { RoleDocument } from "../auth/schema/roles-permission.model";
import { Roles } from "../../common/enums/role.enum";
import { MESSAGES } from "../../common/constants/message.constant";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../../common/errors/app-error";

export class MemberService {
  constructor(
    private workspaceModel: Model<WorkspaceDocument>,
    private memberModel: Model<MemberDocument>,
    private roleModel: Model<RoleDocument>
  ) { }

  public async getMemberRoleInWorkspace(userId: string, workspaceId: string) {    
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException(
        MESSAGES.WORKSPACE.NOT_FOUND.message
      );
    }

    const member = await this.memberModel.findOne({
      userId,
      workspaceId,
    }).populate("role");

    if (!member) {
      throw new UnauthorizedException(
        MESSAGES.WORKSPACE.ACCESS_UNAUTHORIZED.message
      );
    }

    const roleName = member.role?.name;

    return { role: roleName };
  }

  public async joinWorkspaceByInviteService(userId: string, inviteCode: string) {
    // Find workspace by invite code
    const workspace = await this.workspaceModel.findOne({ inviteCode }).exec();
    if (!workspace) {
      throw new NotFoundException(MESSAGES.WORKSPACE.INVALID_INVITE.message);
    }

    // Check if user is already a member
    const existingMember = await this.memberModel.findOne({
      userId,
      workspaceId: workspace._id,
    }).exec();

    if (existingMember) {
      throw new BadRequestException(
        MESSAGES.WORKSPACE.ALREADY_MEMBER.message
      );
    }

    const role = await this.roleModel.findOne({ name: Roles.MEMBER });

    if (!role) {
      throw new NotFoundException(
        MESSAGES.ROLE.NOT_FOUND.message
      );
    }

    // Add user to workspace as a member
    const newMember = new this.memberModel({
      userId,
      workspaceId: workspace._id,
      role: role._id,
    });
    await newMember.save();

    return { workspaceId: workspace._id, role: role.name };
  }
}
