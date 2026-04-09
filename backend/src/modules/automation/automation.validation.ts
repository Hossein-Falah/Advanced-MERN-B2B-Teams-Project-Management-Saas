import { z } from "zod";
import { IntractionTypeEnum } from "../../common/enums/intraction.enum";

export const automationValidatorSchema = z.object({
    type: z.enum(Object.keys(IntractionTypeEnum) as [keyof typeof IntractionTypeEnum]),
    // validation taskId
    taskId: z
        .string({
            required_error: "انتخاب تسک الزامی است",
            invalid_type_error: "شناسه تسک باید متنی باشد",
        })
        .trim()
        .min(1, "شناسه تسک نمی‌تواند خالی باشد"),

    // validation everyday of week
    daysOfWeek: z
        .array(
            z
                .number({
                    invalid_type_error: "روزهای هفته باید عدد باشند",
                })
                .min(0, "روز هفته نمی‌تواند کمتر از ۰ (یکشنبه) باشد")
                .max(6, "روز هفته نمی‌تواند بیشتر از ۶ (شنبه) باشد"),
            {
                required_error: "انتخاب روزهای هفته الزامی است",
                invalid_type_error: "فرمت روزهای هفته نامعتبر است",
            }
        )
        .min(1, "حداقل باید یک روز برای تکرار انتخاب شود"),

    // validation houre
    timeOfDay: z
        .string({
            required_error: "ساعت اجرا الزامی است",
        })
        .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "فرمت ساعت نامعتبر است. مثال معتبر: ۰۹:۳۰"
        ),
});

export const updateAutomationValidatorSchema = z.object({
    type: z
        .enum(Object.keys(IntractionTypeEnum) as [keyof typeof IntractionTypeEnum])
        .optional(),
    taskId: z
        .string({
            invalid_type_error: "شناسه تسک باید متنی باشد",
        })
        .trim()
        .min(1, "شناسه تسک نمی‌تواند خالی باشد")
        .optional(),

    daysOfWeek: z
        .array(
            z
                .number({
                    invalid_type_error: "روزهای هفته باید عدد باشند",
                })
                .min(0, "روز هفته نمی‌تواند کمتر از ۰ (یکشنبه) باشد")
                .max(6, "روز هفته نمی‌تواند بیشتر از ۶ (شنبه) باشد")
        )
        .min(1, "حداقل باید یک روز برای تکرار انتخاب شود")
        .optional(),

    timeOfDay: z
        .string({
            invalid_type_error: "ساعت اجرا باید رشته باشد",
        })
        .regex(
            /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "فرمت ساعت نامعتبر است. مثال معتبر: ۰۹:۳۰"
        )
        .optional(),

    timezone: z.string().optional(),

    nextRunAt: z.date().nullable().optional(),

    lastRunAt: z.date().optional(),

    active: z.boolean().optional(),
})
