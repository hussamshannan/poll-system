import mongoose, { Schema, Model } from "mongoose";

export interface ISiteSettings {
  _id: string;
  theme: {
    themeName: string;
    mode: "light" | "dark";
  };
  updatedBy: string;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    _id: { type: String, default: "singleton" },
    theme: {
      themeName: { type: String, default: "vercel" },
      mode: { type: String, enum: ["light", "dark"], default: "light" },
    },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
