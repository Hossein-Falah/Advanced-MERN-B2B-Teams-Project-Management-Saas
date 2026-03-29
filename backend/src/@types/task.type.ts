type TaskFilters = {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    taskId?: string;
    keyword?: string;
    dueDate?: string;
};

type TaskPagination = {
    pageSize: number;
    pageNumber: number;
};

export {
    TaskFilters,
    TaskPagination
}
