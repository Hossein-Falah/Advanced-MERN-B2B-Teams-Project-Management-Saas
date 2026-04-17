import { BadRequestException } from "../common/errors/app-error";

export const validateTaskDates = (startDate?: Date | null, dueDate?: Date | null) => {
    if (startDate && dueDate) {
        if (startDate.getTime() > dueDate.getTime()) {
            throw new BadRequestException("startDate cannot be after dueDate");
        }
    }
}

export function validateDateTask(startDate: unknown, endDate: unknown): void {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
        throw new BadRequestException("Invalid 'startDate'. Must be a valid Date.");
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
        throw new BadRequestException("Invalid 'endDate'. Must be a valid Date.");
    }

    if (startDate > endDate) {
        throw new BadRequestException("'startDate' must be earlier than or equal to 'endDate'.");
    }
}
