import { BadRequestException } from "../common/errors/app-error";

export const parseDateOrThrow = (
    value: unknown,
    fieldName: string
): Date => {
    if (typeof value !== "string") {
        throw new BadRequestException(`Invalid or missing '${fieldName}'. Must be string.`);
    };

    const date = new Date(value);
    if (isNaN(date.getTime())) {
        throw new BadRequestException(`Invalid date format for '${fieldName}'.`);
    };

    return date;
}
