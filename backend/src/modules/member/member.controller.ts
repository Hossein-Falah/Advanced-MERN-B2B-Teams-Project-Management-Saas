import { z } from "zod";
import { Request, Response } from "express";
import { MemberService } from "./member.service";
import { ResponseHandler } from "../../common/response/response-handler";
import { HTTPSTATUS } from "../../config/http.config";
import { MESSAGES } from "../../common/constants/message.constant";

export class MemberController {
  constructor(private memberService: MemberService) {}

  joinWorkspace = async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const inviteCode = z.string().parse(req.params.inviteCode);
    
    const { workspaceId, role } = await this.memberService.joinWorkspaceByInviteService(
      userId,
      inviteCode
    );

    return ResponseHandler.send(res, {
      statusCode: HTTPSTATUS.OK,
      code: MESSAGES.WORKSPACE.JOINED.code,
      message: MESSAGES.WORKSPACE.JOINED.message,
      data: {
        workspaceId,
        role
      },
    });
  }
}
