import { Request, Response } from "express";
import { ProjectService } from "./project.service";
import { createProjectSchema, projectIdSchema, updateProjectSchema } from "./project.validation";
import { workspaceIdSchema } from "../workspace/workspace.validation";
import { roleGuard } from "../../utils/roleGuard";
import { Permissions } from "../../common/enums/role.enum";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";
import { buildPaginationMeta } from "../../utils/pagination-meta";
import { MemberService } from "../member/member.service";

export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private memberService: MemberService
  ) { }

  createProject = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const body = createProjectSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);


    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_PROJECT]);

    const { project } = await this.projectService.createProject(
      userId,
      workspaceId,
      body
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.CREATED,
      success: true,
      code: MESSAGES.PROJECT.CREATED.code,
      message: MESSAGES.PROJECT.CREATED.message,
      data: project,
    });
  }

  getAllProjectsInWorkspace = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { projects, totalCount } = await this.projectService.getProjectsInWorkspace(workspaceId, page, limit);

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      success: true,
      code: MESSAGES.PROJECT.FETCHED.code,
      message: MESSAGES.PROJECT.FETCHED.message,
      data: projects,
      meta: buildPaginationMeta(page, limit, totalCount)
    });
  };

  getProject = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { project } = await this.projectService.getProjectById(
      workspaceId,
      projectId
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      success: true,
      code: MESSAGES.PROJECT.FETCHED.code,
      message: MESSAGES.PROJECT.FETCHED.message,
      data: project,
    });
  };

  getAnalytics = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);


    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await this.projectService.getProjectAnalytics(
      workspaceId,
      projectId
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      success: true,
      code: MESSAGES.PROJECT.ANALYTICS_FETCHED.code,
      message: MESSAGES.PROJECT.ANALYTICS_FETCHED.message,
      data: analytics,
    });
  };

  updateProject = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const body = updateProjectSchema.parse(req.body);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_PROJECT]);

    const { project } = await this.projectService.updateProject(
      workspaceId,
      projectId,
      body
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      success: true,
      code: MESSAGES.PROJECT.UPDATED.code,
      message: MESSAGES.PROJECT.UPDATED.message,
      data: project,
    });
  };

  deleteProject = async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const projectId = projectIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await this.memberService.getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_PROJECT]);

    await this.projectService.deleteProject(workspaceId, projectId);

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      success: true,
      code: MESSAGES.PROJECT.DELETED.code,
      message: MESSAGES.PROJECT.DELETED.message,
      data: null,
    });
  };
}
