import { BadRequestException } from "./appError";

export const validateTaskDates = (startDate?: Date | null, dueDate?: Date | null) => {
    console.log(startDate);
    console.log(dueDate);
    console.log(startDate?.getTime());
    console.log(dueDate?.getTime());
    
        
    if (startDate && dueDate) {
        if (startDate.getTime() > dueDate.getTime()) {
            throw new BadRequestException("startDate cannot be after dueDate");
        }
    }
}
