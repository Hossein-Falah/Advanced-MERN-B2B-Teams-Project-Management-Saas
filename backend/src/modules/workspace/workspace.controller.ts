import { NextFunction, Request, Response } from "express";
import { WorkspaceService } from "./workspace.service";
import { changeRoleSchema, createWorkspaceSchema, updateWorkspaceSchema } from "./workspace.validation";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import { MemberService } from "../member/member.service";
import { workspaceIdSchema } from "../../common/validator/common.validator";
import { paginationQuerySchema } from "../../common/validator/pagination.validator";
import { buildPaginationMeta } from "../../utils/pagination-meta";

export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private memberService: MemberService
  ) {}

  // Create Workspace
  public createWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {     
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
    } catch (error) {
      next(error);
    }
  };

  // Get all workspaces for user
  public getAllWorkspacesUserIsMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
  
      const paginationFilter = paginationQuerySchema.parse(req.params);

      const { workspaces, pagination } = await this.workspaceService.getAllWorkspacesUserIsMember(paginationFilter, userId);
  
      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.WORKSPACE.LIST_FETCHED.code,
        message: MESSAGES.WORKSPACE.LIST_FETCHED.message,
        data: { workspaces },
        meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.totalCount)
      });
    } catch (error) {
      next(error);
    }
  };

  // Get workspace by ID
  public getWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
    try {      
      const userId = req.user?._id;
  
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  
      await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
  
      const { workspace } = await this.workspaceService.getWorkspaceById(workspaceId);
  
      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.WORKSPACE.FETCHED.code,
        message: MESSAGES.WORKSPACE.FETCHED.message,
        data: { workspace }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get workspace members
  public getWorkspaceMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {    
      const userId = req.user?._id;

      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

      const paginationFilter = paginationQuerySchema.parse(req.query);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
      roleGuard(role, [Permissions.VIEW_ONLY]);
  
      const { members, roles, pagination } = await this.workspaceService.getWorkspaceMembers(paginationFilter, workspaceId);
  
      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.WORKSPACE.MEMBERS_FETCHED.code,
        message: MESSAGES.WORKSPACE.MEMBERS_FETCHED.message,
        data: { members, roles },
        meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.total)
      });
    } catch (error) {
      next(error);
    }
  };

  // Get workspace analytics
  public getWorkspaceAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {   
      const userId = req.user?._id;
  
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  
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
    } catch (error) {
      next(error);
    }
  };

  // Change workspace member role
  public changeWorkspaceMemberRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
  
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

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
    } catch (error) {
      next(error);
    }
  };

  // Update workspace
  public updateWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
    try {     
      const userId = req.user?._id;
  
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
      
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
    } catch (error) {
      next(error);
    }
  };

  // Delete workspace
  public deleteWorkspaceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);
  
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
    } catch (error) {
      next(error);
    }
  };
}
