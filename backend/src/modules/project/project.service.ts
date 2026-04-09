import { Model } from "mongoose";
import { ProjectDocument } from "./project.model";
import { NotFoundException } from "../../common/errors/app-error";
import { MESSAGES } from "../../common/constants/message.constant";
import { toObjectId } from "../../utils/convert-objectId.util";
import { TaskStatusEnum } from "../../common/enums/task.enum";
import { TaskDocument } from "../task/task.model";

export class ProjectService {
  constructor(
    private projectModel: Model<ProjectDocument>,
    private taskModel: Model<TaskDocument>
  ) {};

  async createProject(
    userId: string,
    workspaceId: string,
    body: {
      emoji?: string;
      name: string;
      description?: string;
    }
  ) {
    const project = new this.projectModel({
      ...(body.emoji && { emoji: body.emoji }),
      name: body.name,
      description: body.description,
      workspace: workspaceId,
      createdBy: userId,
    });

    await project.save();

    return { project };
  }

  async getProjectsInWorkspace(
    workspaceId: string,
    page: number,
    limit: number,
  ) {
    const totalCount = await this.projectModel.countDocuments({
      workspace: workspaceId,
    });

    const skip = (page - 1) * limit;

    const projects = await this.projectModel.find({
      workspace: workspaceId,
    })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "_id name profilePicture -password")
      .sort({ createdAt: -1 });


    return { projects, totalCount };
  }

  async getProjectById(workspaceId: string, projectId: string) {
    const project = await this.projectModel.findOne({
      _id: projectId,
      workspace: workspaceId,
    }).select("_id emoji name description");

    if (!project) {
      throw new NotFoundException(MESSAGES.PROJECT.NOT_FOUND.message);
    }

    return { project };
  }

  async getProjectAnalytics(workspaceId: string, projectId: string) {
    const project = await this.projectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
      throw new NotFoundException(MESSAGES.PROJECT.NOT_FOUND.message);
    }

    const currentDate = new Date();

    const taskAnalytics = await this.taskModel.aggregate([
      {
        $match: {
          project: toObjectId(projectId),
        },
      },
      {
        $facet: {
          totalTasks: [{ $count: "count" }],
          overdueTasks: [
            {
              $match: {
                dueDate: { $lt: currentDate },
                status: { $ne: TaskStatusEnum.DONE },
              },
            },
            { $count: "count" },
          ],
          completedTasks: [
            {
              $match: {
                status: TaskStatusEnum.DONE,
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const _analytics = taskAnalytics[0];

    const analytics = {
      totalTasks: _analytics.totalTasks[0]?.count || 0,
      overdueTasks: _analytics.overdueTasks[0]?.count || 0,
      completedTasks: _analytics.completedTasks[0]?.count || 0,
    };

    return { analytics };
  }

  async updateProject(
    workspaceId: string,
    projectId: string,
    body: {
      emoji?: string;
      name: string;
      description?: string;
    }
  ) {
    const { name, emoji, description } = body;

    const project = await this.projectModel.findOne({
      _id: projectId,
      workspace: workspaceId,
    });

    if (!project) {
      throw new NotFoundException(MESSAGES.PROJECT.NOT_FOUND.message);
    }

    if (emoji) project.emoji = emoji;
    if (name) project.name = name;
    if (description) project.description = description;

    await project.save();

    return { project };
  }

  async deleteProject(workspaceId: string, projectId: string) {
    const project = await this.projectModel.findOne({
      _id: projectId,
      workspace: workspaceId,
    });

    if (!project) {
      throw new NotFoundException(MESSAGES.PROJECT.NOT_FOUND.message);
    }

    await project.deleteOne();

    await this.taskModel.deleteMany({
      project: project._id,
    });

    return project;
  }
}
