const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    socketId: {
      type: String,
      required: true,
      index: true,
    },
    matchedSocketId: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying chat history
chatMessageSchema.index({ socketId: 1, matchedSocketId: 1, timestamp: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
