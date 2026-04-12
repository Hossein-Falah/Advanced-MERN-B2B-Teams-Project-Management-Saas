import z from "zod";

export const paginationQuerySchema = z.object({
    page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 1)),
    
    limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v) : 10)),
})
