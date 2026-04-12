import { NextFunction, Request, Response } from "express";
import { ProjectService } from "./project.service";
import { createProjectSchema, updateProjectSchema } from "./project.validation";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { buildPaginationMeta } from "../../utils/pagination-meta";
import { MemberService } from "../member/member.service";
import { projectIdSchema, workspaceIdSchema } from "../../common/validator/common.validator";
import { paginationQuerySchema } from "../../common/validator/pagination.validator";

export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private memberService: MemberService
  ) { }

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      
      const { workspaceId } = req.params;
  
      const workspaceID = workspaceIdSchema.parse(workspaceId);
      
      const body = createProjectSchema.parse(req.body);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.CREATE_PROJECT]);
  
      const { project } = await this.projectService.createProject(
        userId,
        workspaceID,
        body
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.CREATED,
        success: true,
        code: MESSAGES.PROJECT.CREATED.code,
        message: MESSAGES.PROJECT.CREATED.message,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  }

  getAllProjectsInWorkspace = async (req: Request, res: Response, next: NextFunction) => {
    try {      
      const userId = req.user?._id;
    
      const workspaceID = workspaceIdSchema.parse(req.params.workspaceId);

      const paginationFilter = paginationQuerySchema.parse(req.query);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.VIEW_ONLY]);
  
      const { projects, pagination } = await this.projectService.getProjectsInWorkspace(paginationFilter, workspaceID);
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        success: true,
        code: MESSAGES.PROJECT.FETCHED.code,
        message: MESSAGES.PROJECT.FETCHED.message,
        data: { projects },
        meta: buildPaginationMeta(pagination.page, pagination.limit, pagination.totalCount)
      });
    } catch (error) {
      next(error);
    }
  };

  getProject = async (req: Request, res: Response, next: NextFunction) => {
    try {      
      const userId = req.user?._id;
  
      const { id, workspaceId } = req.params;
  
      const projectId = projectIdSchema.parse(id);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.VIEW_ONLY]);
  
      const { project } = await this.projectService.getProjectById(
        workspaceID,
        projectId
      );
  
      return ResponseHandler.send(res, {
        success: true,
        statusCode: HTTPSTATUS.OK,
        code: MESSAGES.PROJECT.FETCHED.code,
        message: MESSAGES.PROJECT.FETCHED.message,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  };

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {      
      const userId = req.user?._id;
  
      const { id, workspaceId } = req.params;
      
      const projectId = projectIdSchema.parse(id);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.VIEW_ONLY]);
  
      const { analytics } = await this.projectService.getProjectAnalytics(
        workspaceID,
        projectId
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        success: true,
        code: MESSAGES.PROJECT.ANALYTICS_FETCHED.code,
        message: MESSAGES.PROJECT.ANALYTICS_FETCHED.message,
        data: { analytics },
      });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
  
      const { id, workspaceId } = req.params;
  
      const projectId = projectIdSchema.parse(id);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const body = updateProjectSchema.parse(req.body);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.EDIT_PROJECT]);
  
      const { project } = await this.projectService.updateProject(
        workspaceID,
        projectId,
        body
      );
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        success: true,
        code: MESSAGES.PROJECT.UPDATED.code,
        message: MESSAGES.PROJECT.UPDATED.message,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {   
      const userId = req.user?._id;

      const { id, workspaceId } = req.params;
  
      const projectId = projectIdSchema.parse(id);
      const workspaceID = workspaceIdSchema.parse(workspaceId);
  
      const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceID);
      roleGuard(role, [Permissions.DELETE_PROJECT]);
  
      const project = await this.projectService.deleteProject(workspaceID, projectId);
  
      return ResponseHandler.send(res, {
        statusCode: HTTPSTATUS.OK,
        success: true,
        code: MESSAGES.PROJECT.DELETED.code,
        message: MESSAGES.PROJECT.DELETED.message,
        data: { project },
      });
    } catch (error) {
      next(error);
    }
  };
}
