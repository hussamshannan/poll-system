import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPollOption {
  _id: mongoose.Types.ObjectId;
  text: string;
  order: number;
}

export interface IPoll extends Document {
  title: string;
  description: string;
  options: IPollOption[];
  status: "draft" | "open" | "closed";
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
  expiresAt: Date | null;
  releaseAt: Date | null;
  createdBy: string;
  totalVotes: number;
  createdAt: Date;
  updatedAt: Date;
  isExpired: boolean;
}

const PollOptionSchema = new Schema<IPollOption>({
  text: { type: String, required: true },
  order: { type: Number, required: true },
});

const PollSchema = new Schema<IPoll>(
  {
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 1000 },
    options: { type: [PollOptionSchema], required: true },
    status: {
      type: String,
      enum: ["draft", "open", "closed"],
      default: "open",
    },
    allowMultipleVotes: { type: Boolean, default: false },
    isAnonymous: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    releaseAt: { type: Date, default: null },
    createdBy: { type: String, required: true, index: true },
    totalVotes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

PollSchema.index({ createdBy: 1, createdAt: -1 });
PollSchema.index({ expiresAt: 1 }, { sparse: true });
PollSchema.index({ releaseAt: 1 }, { sparse: true });
PollSchema.index({ title: "text", description: "text" });

PollSchema.virtual("isExpired").get(function (this: IPoll) {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

const Poll: Model<IPoll> =
  mongoose.models.Poll || mongoose.model<IPoll>("Poll", PollSchema);

export default Poll;
