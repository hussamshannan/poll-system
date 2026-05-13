import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const ObjectIdString = z
  .string()
  .regex(objectIdRegex, "Invalid id");

export const ResolveDuplicateGroupSchema = z
  .object({
    pollId: ObjectIdString,
    keepVoteId: ObjectIdString,
    removeVoteIds: z.array(ObjectIdString).min(1),
  })
  .refine((data) => !data.removeVoteIds.includes(data.keepVoteId), {
    message: "keepVoteId cannot be in removeVoteIds",
    path: ["removeVoteIds"],
  });

export type ResolveDuplicateGroupInput = z.infer<
  typeof ResolveDuplicateGroupSchema
>;
