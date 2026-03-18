import { Types } from "mongoose";
import { BadRequestException } from "./appError";

export const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
    if (id instanceof Types.ObjectId) return id;

    if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException("شناسه وارد شده اشتباه می باشد");
    }

    return new Types.ObjectId(id);
}
