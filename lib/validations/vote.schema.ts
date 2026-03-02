import { z } from "zod";

export const CastVoteSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required"),
  optionIds: z
    .array(z.string().min(1))
    .min(1, "At least one option must be selected"),
  voterName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  voterPhone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s\-().]{7,20}$/,
      "Enter a valid phone number (e.g. +966501234567)"
    ),
});

export type CastVoteInput = z.infer<typeof CastVoteSchema>;

export const CheckVoteSchema = z.object({
  pollId: z.string().min(1, "Poll ID is required"),
  voterPhone: z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s\-().]{7,20}$/,
      "Enter a valid phone number"
    ),
});

export type CheckVoteInput = z.infer<typeof CheckVoteSchema>;
