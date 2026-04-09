export class ApiResponse<T, M = any> {
    success: boolean;
    code: string;
    statusCode: number;
    message: string;
    data: T | null;
    meta?: M;
    
    constructor({
        success = true,
        code = "SUCCESS",
        statusCode = 200,
        message = "Success",
        data = null,
        meta
    }: {
        success?: boolean;
        code?: string;
        statusCode?: number;
        message?: string;
        data?: T | null;
        meta?: M;
    }) {
        this.success = success;
        this.code = code;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.meta = meta
    }
}
