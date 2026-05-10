import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVote extends Document {
  pollId: mongoose.Types.ObjectId;
  optionIds: mongoose.Types.ObjectId[];
  voterName: string;
  voterPhone: string;
  votedAt: Date;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    pollId: {
      type: Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    optionIds: [{ type: Schema.Types.ObjectId, required: true }],
    voterName: { type: String, required: true, trim: true },
    voterPhone: { type: String, required: true, trim: true },
    votedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

VoteSchema.index({ pollId: 1, voterPhone: 1 }, { unique: true });
VoteSchema.index({ pollId: 1, voterName: 1 }, { unique: true });
VoteSchema.index({ pollId: 1, votedAt: 1 });

// In development, clear cached model so schema changes take effect on hot reload
if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as Record<string, unknown>).Vote;
}

const Vote: Model<IVote> =
  (mongoose.models.Vote as Model<IVote>) ||
  mongoose.model<IVote>("Vote", VoteSchema);

export default Vote;
