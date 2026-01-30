const mongoose = require("mongoose");
const validator = require("validator");

// Helper function to normalize Arabic text for uniqueness
const normalizeArabicText = (text) => {
  if (!text) return text;

  // Convert to Unicode Normalization Form C (NFC)
  // This combines characters and diacritics into a single code point
  let normalized = text.normalize("NFC");

  // Remove diacritics (tashkeel) - optional, depending on your requirements
  normalized = normalized.replace(/[\u064B-\u065F]/g, "");

  // Remove extra whitespace
  normalized = normalized.trim().replace(/\s+/g, " ");

  // Convert to lowercase for case-insensitive comparison
  // (Arabic doesn't have case, but we can use it for consistency)
  return normalized.toLowerCase();
};

// Custom validator for unique name with Arabic support
const createUniqueNameValidator = (model) => {
  return async function (value) {
    if (!value) return true;

    const normalizedValue = normalizeArabicText(value);
    const currentDocId = this._id;

    // Find any other document with the same normalized name
    const existingDoc = await model.findOne({
      _id: { $ne: currentDocId },
      normalizedName: normalizedValue,
    });

    if (existingDoc) {
      throw new Error(`Name '${value}' is already taken (similar name exists)`);
    }

    return true;
  };
};

const voteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [100, "Name cannot exceed 100 characters"],
    // We'll handle uniqueness separately to account for Arabic variations
  },
  normalizedName: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    validate: {
      validator: function (v) {
        // Clean the phone number before validation
        const cleaned = v.replace(/[\s\-\(\)\.]/g, "");
        return /^[\+]?[1-9][\d]{0,15}$/.test(cleaned);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  answer: {
    type: String,
    required: [true, "Answer is required"],
    enum: ["Yes", "No"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to normalize and validate
voteSchema.pre("save", async function (next) {
  try {
    // Normalize the name
    this.normalizedName = normalizeArabicText(this.name);

    // Check for duplicate normalized name
    const existingVote = await this.constructor.findOne({
      normalizedName: this.normalizedName,
      _id: { $ne: this._id },
    });

    if (existingVote) {
      const error = new Error(
        `Name '${this.name}' is already taken (similar name exists)`
      );
      return next(error);
    }

    // Clean phone number
    if (this.phone) {
      this.phone = this.phone.replace(/[\s\-\(\)\.]/g, "");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-findOneAndUpdate middleware (for updates)
voteSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();

    if (update.name) {
      const normalizedName = normalizeArabicText(update.name);
      this.setUpdate({
        ...update,
        normalizedName: normalizedName,
      });

      // Check for duplicate normalized name
      const currentDocId = this.getQuery()._id;
      const existingVote = await this.model.findOne({
        normalizedName: normalizedName,
        _id: { $ne: currentDocId },
      });

      if (existingVote) {
        const error = new Error(
          `Name '${update.name}' is already taken (similar name exists)`
        );
        return next(error);
      }
    }

    if (update.phone) {
      this.setUpdate({
        ...update,
        phone: update.phone.replace(/[\s\-\(\)\.]/g, ""),
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Create indexes for faster queries
voteSchema.index(
  { normalizedName: 1 },
  {
    unique: true,
    partialFilterExpression: { normalizedName: { $exists: true } },
  }
);
voteSchema.index({ phone: 1 }, { unique: true });
voteSchema.index({ answer: 1 });
voteSchema.index({ createdAt: -1 });

// Static method to find by name (with Arabic normalization)
voteSchema.statics.findByName = async function (name) {
  const normalizedName = normalizeArabicText(name);
  return this.findOne({ normalizedName });
};

// Static method to check if name exists
voteSchema.statics.nameExists = async function (name) {
  const normalizedName = normalizeArabicText(name);
  const existing = await this.findOne({ normalizedName });
  return !!existing;
};

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
