import { z } from "zod";

export const PollOptionSchema = z.object({
  _id: z.string().optional(),
  text: z.string().min(1, "Option text is required").max(200, "Option text too long"),
});

export const CreatePollSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().max(1000, "Description too long").default(""),
    options: z
      .array(PollOptionSchema)
      .min(2, "At least 2 options required")
      .max(10, "Maximum 10 options"),
    choicesPerVoter: z
      .number()
      .int()
      .min(1, "At least 1 choice required")
      .max(10, "Maximum 10 choices")
      .default(1),
    isAnonymous: z.boolean().default(false),
    expiresAt: z.string().nullable().default(null),
    releaseAt: z.string().nullable().default(null),
  })
  .superRefine((data, ctx) => {
    if (data.choicesPerVoter > data.options.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["choicesPerVoter"],
        message: "Cannot exceed the number of options",
      });
    }
  });

export const UpdatePollSchema = z
  .object({
    pollId: z.string().min(1, "Poll ID is required"),
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title too long")
      .optional(),
    description: z.string().max(1000, "Description too long").optional(),
    options: z
      .array(PollOptionSchema)
      .min(2, "At least 2 options required")
      .max(10, "Maximum 10 options")
      .optional(),
    status: z.enum(["draft", "open", "closed"]).optional(),
    choicesPerVoter: z
      .number()
      .int()
      .min(1, "At least 1 choice required")
      .max(10, "Maximum 10 choices")
      .optional(),
    isAnonymous: z.boolean().optional(),
    expiresAt: z.string().nullable().optional(),
    releaseAt: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    // Only check when both fields are present in the same update payload.
    if (
      data.choicesPerVoter !== undefined &&
      data.options !== undefined &&
      data.choicesPerVoter > data.options.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["choicesPerVoter"],
        message: "Cannot exceed the number of options",
      });
    }
  });

export type CreatePollInput = z.infer<typeof CreatePollSchema>;
export type UpdatePollInput = z.infer<typeof UpdatePollSchema>;
