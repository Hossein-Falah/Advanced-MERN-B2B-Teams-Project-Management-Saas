const parseArray = (value?: string | string[]) =>
    typeof value === "string" ? value.split(",") : undefined;

export const parseTaskFilters = (query: any) => ({
    projectId: query.projectId as string | undefined,
    status: parseArray(query.status),
    priority: parseArray(query.priority),
    assignedTo: parseArray(query.assignedTo),
    taskId: query.taskId as string | undefined,
    keyword: query.keyword as string | undefined,
    dueDate: query.dueDate as string | undefined,
});
