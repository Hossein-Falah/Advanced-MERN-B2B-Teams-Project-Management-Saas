import { Model } from "mongoose";
import { ProjectDocument } from "./project.model";

export class ProjectRepository {
    constructor(
        private projectModel: Model<ProjectDocument>
    ) {}
    public async create(projectData: ProjectDocument) {
        const project = new this.projectModel(projectData);
        await project.save();
        return project;
    }

    public async countByWorkspace(workspaceId: string) {
        return this.projectModel.countDocuments({ workspace: workspaceId });
    }

    public async findByWorkspace(workspaceId: string, skip: number, limit: number) {
        return this.projectModel.find({ workspace: workspaceId })
            .skip(skip)
            .limit(limit)
            .populate("createdBy", "_id name profilePicture -password")
            .sort({ createdAt: -1 });
    }

    public async findByIdAndWorkspace(projectId: string, workspaceId: string) {
        return this.projectModel.findOne({
            _id: projectId,
            workspace: workspaceId,
        }).select("_id emoji name description");
    }

    public async delete(projectId: string) {
        return this.projectModel.deleteOne({ _id: projectId });
    }
}
