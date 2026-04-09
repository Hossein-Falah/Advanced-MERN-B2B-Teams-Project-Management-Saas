import { Request, Response } from "express";
import { WorkspaceService } from "./workspace.service";
import { changeRoleSchema, createWorkspaceSchema, updateWorkspaceSchema, workspaceIdSchema } from "./workspace.validation";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import { MemberService } from "../member/member.service";

export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private memberService: MemberService
  ) {}

  // Create Workspace
  public createWorkspace = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createWorkspaceSchema.parse(req.body);

    const { workspace } = await this.workspaceService.createWorkspace(userId, body);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.CREATED,
      code: MESSAGES.WORKSPACE.CREATED.code,
      message: MESSAGES.WORKSPACE.CREATED.message,
      data: { workspace }
    });
  };

  // Get all workspaces for user
  public getAllWorkspacesUserIsMember = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const { workspaces } = await this.workspaceService.getAllWorkspacesUserIsMember(userId);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.WORKSPACE.LIST_FETCHED.code,
      message: MESSAGES.WORKSPACE.LIST_FETCHED.message,
      data: { workspaces }
    });
  };

  // Get workspace by ID
  public getWorkspaceById = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.id);

    await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);

    const { workspace } = await this.workspaceService.getWorkspaceById(workspaceId);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.WORKSPACE.FETCHED.code,
      message: MESSAGES.WORKSPACE.FETCHED.message,
      data: { workspace }
    });
  };

  // Get workspace members
  public getWorkspaceMembers = async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = req.user?._id;

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { members, roles } = await this.workspaceService.getWorkspaceMembers(workspaceId);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.WORKSPACE.MEMBERS_FETCHED.code,
      message: MESSAGES.WORKSPACE.MEMBERS_FETCHED.message,
      data: { members, roles }
    });
  };

  // Get workspace analytics
  public getWorkspaceAnalytics = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.id);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await this.workspaceService.getWorkspaceAnalytics(workspaceId);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.WORKSPACE.ANALYTICS_FETCHED.code,
      message: MESSAGES.WORKSPACE.ANALYTICS_FETCHED.message,
      data: { analytics }
    });
  };

  // Change workspace member role
  public changeWorkspaceMemberRole = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { memberId, roleId } = changeRoleSchema.parse(req.body);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);

    const { member } = await this.workspaceService.changeMemberRole(workspaceId, memberId, roleId);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.WORKSPACE.ROLE_CHANGED.code,
      message: MESSAGES.WORKSPACE.ROLE_CHANGED.message,
      data: { member }
    });
  };

  // Update workspace
  public updateWorkspaceById = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { name, description } = updateWorkspaceSchema.parse(req.body);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_WORKSPACE]);

    const { workspace } = await this.workspaceService.updateWorkspaceById(workspaceId, name, description);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.WORKSPACE.UPDATED.code,
      message: MESSAGES.WORKSPACE.UPDATED.message,
      data: { workspace }
    });
  };

  // Delete workspace
  public deleteWorkspaceById = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const workspaceId = workspaceIdSchema.parse(req.params.id);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_WORKSPACE]);

    const { currentWorkspace } = await this.workspaceService.deleteWorkspace(workspaceId, userId);

    return ResponseHandler.send(res, {
      success: true,
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.WORKSPACE.DELETED.code,
      message: MESSAGES.WORKSPACE.DELETED.message,
      data: { currentWorkspace }
    });
  };
}
