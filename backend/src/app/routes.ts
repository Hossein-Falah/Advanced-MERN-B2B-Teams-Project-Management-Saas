import { Application } from "express";
import { config } from "../config/app.config";
import { errorHandler } from "../common/middlewares/error-handler";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/user/user.route";
import workspaceRoutes from "../modules/workspace/workspace.route";
import memberRoutes from "../modules/member/member.route";
import projectRoutes from "../modules/project/project.route";
import taskRoutes from "../modules/task/task.route";
import taskLogRoutes from "../modules/task-log/task-log.route";
import commentRoutes from "../modules/comment/comment.route";
import notificationRoutes from "../modules/notification/notification.route";
import mentionRoutes from "../modules/mention/mention.route";
import analyticsRoutes from "../modules/analytics/analytics.route";
import automationRoutes from "../modules/automation/automation.route";
import isAuthenticated from "../common/middlewares/isAuthenticated.middleware";
import fileRoutes from "../modules/file/file.route";

export class Routes {
    constructor(private app: Application) {
        this.register();
    }

    private register() {
        const BASE_PATH = config.BASE_PATH;

        this.app.use(`${BASE_PATH}/auth`, authRoutes);
        this.app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
        this.app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
        this.app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
        this.app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
        this.app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);
        this.app.use(`${BASE_PATH}/log`, isAuthenticated, taskLogRoutes);
        this.app.use(`${BASE_PATH}/comment`, isAuthenticated, commentRoutes);
        this.app.use(`${BASE_PATH}/notification`, isAuthenticated, notificationRoutes);
        this.app.use(`${BASE_PATH}/mention`, isAuthenticated, mentionRoutes);
        this.app.use(`${BASE_PATH}/automation`, isAuthenticated, automationRoutes);
        this.app.use(`${BASE_PATH}/analytics`, isAuthenticated, analyticsRoutes);
        this.app.use(`${BASE_PATH}/files`, isAuthenticated, fileRoutes)

        this.app.use(errorHandler);
    }
}
