import { z } from "zod";

export const PollOptionSchema = z.object({
  text: z.string().min(1, "Option text is required").max(200, "Option text too long"),
});

export const CreatePollSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").default(""),
  options: z
    .array(PollOptionSchema)
    .min(2, "At least 2 options required")
    .max(10, "Maximum 10 options"),
  allowMultipleVotes: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
  expiresAt: z.string().nullable().default(null),
});

export const UpdatePollSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
  description: z.string().max(1000, "Description too long").optional(),
  options: z
    .array(PollOptionSchema)
    .min(2, "At least 2 options required")
    .max(10, "Maximum 10 options")
    .optional(),
  status: z.enum(["draft", "open", "closed"]).optional(),
  allowMultipleVotes: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
  expiresAt: z.string().nullable().optional(),
});

export type CreatePollInput = z.infer<typeof CreatePollSchema>;
export type UpdatePollInput = z.infer<typeof UpdatePollSchema>;
