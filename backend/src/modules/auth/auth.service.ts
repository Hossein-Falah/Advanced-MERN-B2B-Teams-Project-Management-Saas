import mongoose, { Model } from "mongoose";
import { UserDocument } from "../user/interfaces/user.interface";
import { AccountDocument } from "./schema/account.model";

import { ProviderEnum } from "../../common/enums/account-provider.enum";
import { MemberDocument } from "../member/member.model";
import { RoleDocument } from "./schema/roles-permission.model";
import { WorkspaceDocument } from "../workspace/workspace.model";
import { Roles } from "../../common/enums/role.enum";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../../common/errors/app-error";

export class AuthService {
  constructor(
    private userModel: Model<UserDocument>,
    private accountModel: Model<AccountDocument>,
    private memberModel: Model<MemberDocument>,
    private roleModel: Model<RoleDocument>,
    private workspaceModel: Model<WorkspaceDocument>,
  ) { }

  async loginOrCreateAccount(data: {
    provider: string;
    displayName: string;
    providerId: string;
    picture?: string;
    email?: string;
  }) {

    const { providerId, provider, displayName, email, picture } = data;

    let user = await this.userModel.findOne({ email });

    if (!user) {

      user = new this.userModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });

      await user.save();

      await new this.accountModel({
        userId: user._id,
        provider,
        providerId,
      }).save();

      const workspace = await this.createWorkspaceForUser(user);

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save();
    }

    return { user };
  }

  async registerUser(body: {
    email: string;
    name: string;
    password: string;
    phone: string;
  }) {

    const { email, name, password, phone } = body;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const existingPhone = await this.userModel.findOne({ phone });
    if (existingPhone) {
      throw new BadRequestException("Phone already exists");
    }

    let username = email.split("@")[0];

    const usernameExists = await this.userModel.findOne({ username });
    if (usernameExists) {
      username = `${username}${Math.floor(Math.random() * 1000)}`;
    }

    const user = new this.userModel({
      email,
      name,
      password,
      username,
      phone,
    });

    await user.save();

    await new this.accountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    }).save();

    const workspace = await this.createWorkspaceForUser(user);

    user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
    await user.save();

    return {
      userId: user._id,
      workspaceId: workspace._id,
    };
  }

  async verifyUser(data: {
    email: string;
    password: string;
    provider?: string;
  }) {

    const { email, password, provider = ProviderEnum.EMAIL } = data;

    const account = await this.accountModel.findOne({
      provider,
      providerId: email,
    });

    if (!account) {
      throw new NotFoundException("Invalid email or password");
    }

    const user = await this.userModel.findById(account.userId);

    if (!user) {
      throw new NotFoundException("User not found for the given account");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return user.omitPassword();
  }

  private async createWorkspaceForUser(user: any) {

    const workspace = new this.workspaceModel({
      name: "My Workspace",
      description: `Workspace created for ${user.name}`,
      owner: user._id,
    });

    await workspace.save();

    const ownerRole = await this.roleModel.findOne({
      name: Roles.OWNER,
    });

    if (!ownerRole) {
      throw new NotFoundException("Owner role not found");
    }

    await new this.memberModel({
      userId: user._id,
      workspaceId: workspace._id,
      role: ownerRole._id,
      joinedAt: new Date(),
    }).save();

    return workspace;
  }

}
