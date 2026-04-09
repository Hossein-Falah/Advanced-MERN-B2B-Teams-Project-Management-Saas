import { AnalyticsController } from "../../modules/analytics/analytics.controller";
import { AnalyticsRepository } from "../../modules/analytics/analytics.repository";
import { AnalyticsService } from "../../modules/analytics/analytics.service";
import { AuthController } from "../../modules/auth/auth.controller";
import { AuthService } from "../../modules/auth/auth.service";
import { AutomationController } from "../../modules/automation/automation.controller";
import { AutomationService } from "../../modules/automation/services/automation.service";
import { CommentController } from "../../modules/comment/comment.controller";
import { CommentService } from "../../modules/comment/comment.service";
import { MemberController } from "../../modules/member/member.controller";
import { MemberService } from "../../modules/member/member.service";
import { MentionController } from "../../modules/mention/mention.controller";
import { MentionService } from "../../modules/mention/mention.service";
import { NotificationController } from "../../modules/notification/notification.controller";
import { NotificationService } from "../../modules/notification/notification.service";
import { ProjectController } from "../../modules/project/project.controller";
import { ProjectService } from "../../modules/project/project.service";
import { TaskLogController } from "../../modules/task-log/task-log.controller";
import { TaskLogService } from "../../modules/task-log/task-log.service";
import { TaskController } from "../../modules/task/task.controller";
import { TaskService } from "../../modules/task/task.service";
import { UserController } from "../../modules/user/user.controller";
import { UserService } from "../../modules/user/user.service";
import { WorkspaceController } from "../../modules/workspace/workspace.controller";
import { WorkspaceService } from "../../modules/workspace/workspace.service";

export type Container = {
    // repository
    analyticsRepository: AnalyticsRepository,

    // Services
    analyticsService: AnalyticsService,
    authService: AuthService,
    automationService: AutomationService,
    commentService: CommentService,
    memberService: MemberService,
    notificationService: NotificationService,
    projectService: ProjectService,
    taskService: TaskService,
    taskLogService: TaskLogService,
    userService: UserService,
    workspaceService: WorkspaceService,
    mentionService: MentionService,

    // Controllers
    analyticsController: AnalyticsController,
    authController: AuthController,
    automationController: AutomationController,
    commentController: CommentController,
    memberController: MemberController,
    notificationController: NotificationController,
    projectController: ProjectController,
    taskController: TaskController,
    taskLogController: TaskLogController,
    userController: UserController,
    workspaceController: WorkspaceController,
    mentionController: MentionController
};
