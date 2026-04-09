import { BadRequestException } from "../common/errors/app-error";

export const validateTaskDates = (startDate?: Date | null, dueDate?: Date | null) => {
    if (startDate && dueDate) {
        if (startDate.getTime() > dueDate.getTime()) {
            throw new BadRequestException("startDate cannot be after dueDate");
        }
    }
}
