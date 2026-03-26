import "dotenv/config";

import http from "http";
import cors from "cors";
import schedule from "node-schedule";
import passport from "passport";
import session from "cookie-session";
import express, { NextFunction, Request, Response } from "express";

import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { BadRequestException } from "./utils/appError";
import { ErrorCodeEnum } from "./enums/error-code.enum";

import "./config/passport.config";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import commentRoutes from "./routes/comment.route";
import taskLogRoutes from "./routes/task-log.route";
import { registerSocket } from "./socket";
import notificationRoutes from "./modules/notification/notification.route";
import mentionRoutes from "./modules/mention/mention.route";
import automationRoutes from "./modules/automation/automation.route";
import { scheduler } from "./modules/automation/workers/scheduler.service";

const app = express();
const BASE_PATH = config.BASE_PATH;

const server = http.createServer(app);
registerSocket(server);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      config.FRONTEND_ORIGIN,
      config.FRONTEND_DEVELOPMENT,
      "http://localhost:5173",
      "http://localhost:8010",
      "https://task.teleservat.com"
    ],
    credentials: true,
  })
);

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
    secure: false,
    httpOnly: true,
    path: '/'
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get(
  `/`,
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException(
      "This is a bad request",
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel & share",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);
app.use(`${BASE_PATH}/log`, isAuthenticated, taskLogRoutes);
app.use(`${BASE_PATH}/comment`, isAuthenticated, commentRoutes);
app.use(`${BASE_PATH}/notification`, isAuthenticated, notificationRoutes);
app.use(`${BASE_PATH}/mention`, isAuthenticated, mentionRoutes);
app.use(`${BASE_PATH}/automation`, isAuthenticated, automationRoutes);

app.use(errorHandler);

schedule.scheduleJob("*/1 * * * *", async () => {
  console.log("runs every minute");

  await scheduler();
})

server.listen(config.PORT, async () => {
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
