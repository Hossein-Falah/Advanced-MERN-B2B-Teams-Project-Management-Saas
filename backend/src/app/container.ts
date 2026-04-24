import { AnalyticsController } from "../modules/analytics/analytics.controller";
import { AnalyticsRepository } from "../modules/analytics/analytics.repository";
import { AnalyticsService } from "../modules/analytics/analytics.service";
import { AuthController } from "../modules/auth/auth.controller";
import { AuthService } from "../modules/auth/auth.service";
import AccountModel from "../modules/auth/schema/account.model";
import RoleModel from "../modules/auth/schema/roles-permission.model";
import { AutomationController } from "../modules/automation/automation.controller";
import AutomationModel from "../modules/automation/automation.model";
import { AutomationService } from "../modules/automation/services/automation.service";
import { S3Service } from "../modules/aws/aws-s3.service";
import { CommentController } from "../modules/comment/comment.controller";
import CommentModel from "../modules/comment/comment.model";
import { CommentService } from "../modules/comment/comment.service";
import { FileController } from "../modules/file/file.controller";
import FileModel from "../modules/file/file.model";
import { FileRepository } from "../modules/file/file.repository";
import { FileService } from "../modules/file/file.service";
import { MemberController } from "../modules/member/member.controller";
import MemberModel from "../modules/member/member.model";
import { MemberService } from "../modules/member/member.service";
import { MentionController } from "../modules/mention/mention.controller";
import { MentionService } from "../modules/mention/mention.service";
import { NotificationController } from "../modules/notification/notification.controller";
import NotificationModel from "../modules/notification/notification.model";
import { NotificationService } from "../modules/notification/notification.service";
import { ProjectController } from "../modules/project/project.controller";
import ProjectModel from "../modules/project/project.model";
import { ProjectService } from "../modules/project/project.service";
import { TaskLogController } from "../modules/task-log/task-log.controller";
import TaskLogModel from "../modules/task-log/task-log.model";
import { TaskLogService } from "../modules/task-log/task-log.service";
import { TaskController } from "../modules/task/task.controller";
import TaskModel from "../modules/task/task.model";
import { TaskService } from "../modules/task/task.service";
import { UserController } from "../modules/user/user.controller";
import UserModel from "../modules/user/user.model";
import { UserService } from "../modules/user/user.service";
import { WorkspaceController } from "../modules/workspace/workspace.controller";
import WorkspaceModel from "../modules/workspace/workspace.model";
import { WorkspaceService } from "../modules/workspace/workspace.service";
import { Container } from "./types/container.type";

let container: Container | null = null;

export function getContainer() {
    if (container) return container;

    // ---- Instantiate Repositories ----
    const analyticsRepository = new AnalyticsRepository(TaskModel, MemberModel);
    const fileRepository = new FileRepository(FileModel);

    // ---- Instantiate Services ----
    const s3Service = new S3Service({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION!,
        endpoint: process.env.AWS_ENDPOINT!,
        bucket: process.env.AWS_S3_BUCKET_NAME!,
    });

    const authService = new AuthService(
        UserModel, AccountModel, MemberModel, 
        RoleModel, WorkspaceModel
    );
    const memberService = new MemberService(WorkspaceModel, MemberModel, RoleModel);
    const notificationService = new NotificationService(NotificationModel);
    const projectService = new ProjectService(ProjectModel, TaskModel);
    const taskLogService = new TaskLogService(
        TaskModel, TaskLogModel
    );

  
    const workspaceService = new WorkspaceService(
        UserModel, RoleModel, WorkspaceModel, 
        MemberModel, ProjectModel, TaskModel
    );
    const mentionService = new MentionService(UserModel, MemberModel, notificationService);
    const fileService = new FileService(fileRepository, s3Service, UserModel);
    const userService = new UserService(UserModel, MemberModel, fileService);
        const analyticsService = new AnalyticsService(analyticsRepository, userService);
    const commentService = new CommentService(mentionService, fileService, TaskModel, CommentModel);

    const taskService = new TaskService(
        ProjectModel, MemberModel, TaskModel, 
        TaskLogModel, CommentModel, AutomationModel, 
        notificationService, taskLogService, fileService
    );

    const automationService = new AutomationService(
        AutomationModel, taskService
    );

    // ---- Instantiate Controllers ----
    const analyticsController = new AnalyticsController(analyticsService, memberService);
    const authController = new AuthController(authService);
    const automationController = new AutomationController(memberService, automationService);
    const commentController = new CommentController(commentService, memberService);
    const memberController = new MemberController(memberService);
    const notificationController = new NotificationController(notificationService);
    const projectController = new ProjectController(projectService, memberService);
    const taskController = new TaskController(taskService, memberService);
    const taskLogController = new TaskLogController(taskLogService);
    const userController = new UserController(userService);
    const workspaceController = new WorkspaceController(workspaceService, memberService);
    const mentionController = new MentionController(mentionService);
    const fileController = new FileController(fileService);

    container = {
        // Repositories
        analyticsRepository,
        fileRepository,

        // Services
        analyticsService,
        authService,
        automationService,
        commentService,
        memberService,
        notificationService,
        projectService,
        taskService,
        taskLogService,
        userService,
        workspaceService,
        mentionService,
        fileService,

        // Controllers
        analyticsController,
        authController,
        automationController,
        commentController,
        memberController,
        notificationController,
        projectController,
        taskController,
        taskLogController,
        userController,
        workspaceController,
        mentionController,
        fileController
    };

    return container;
}
