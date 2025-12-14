const mongoose = require("mongoose");

const userSessionSchema = new mongoose.Schema(
  {
    socketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["waiting", "chatting", "disconnected"],
      default: "waiting",
      index: true,
    },
    matchedWith: {
      type: String,
      default: null,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // Auto-delete after 1 hour
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
userSessionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("UserSession", userSessionSchema);
