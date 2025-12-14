const MatchingService = require("../services/matchingService");

const handleSocketConnection = (socket, io) => {
  console.log(`User connected: ${socket.id}`);

  // User wants to start chatting
  socket.on("start-chat", async () => {
    try {
      // Update user status to waiting
      await MatchingService.updateUserSession(socket.id, "waiting");
      console.log("User status updated to waiting");
      // Try to find a match
      const matchedSocketId = await MatchingService.findMatch(socket.id);
      console.log("Matched socket ID:", matchedSocketId);
      if (matchedSocketId) {
        // Match found - connect both users
        await MatchingService.updateUserSession(
          socket.id,
          "chatting",
          matchedSocketId
        );
        await MatchingService.updateUserSession(
          matchedSocketId,
          "chatting",
          socket.id
        );

        // Notify both users
        socket.emit("matched", { matchedSocketId });
        io.to(matchedSocketId).emit("matched", { matchedSocketId: socket.id });

        console.log(`Matched ${socket.id} with ${matchedSocketId}`);
      } else {
        // No match found - user is waiting
        socket.emit("waiting");
        console.log(`User ${socket.id} is waiting for a match`);
      }
    } catch (error) {
      console.error("Error in start-chat:", error);
      socket.emit("error", { message: "Failed to start chat" });
    }
  });

  // User sends a message
  socket.on("send-message", async (data) => {
    try {
      const { message, matchedSocketId } = data;

      if (!message || !matchedSocketId) {
        socket.emit("error", { message: "Invalid message data" });
        return;
      }

      // Verify the match is still active
      const session = await MatchingService.getUserSession(socket.id);
      if (
        !session ||
        session.matchedWith !== matchedSocketId ||
        session.status !== "chatting"
      ) {
        socket.emit("error", { message: "Match not found or disconnected" });
        return;
      }

      // Send message to the matched user
      io.to(matchedSocketId).emit("receive-message", {
        message,
        from: socket.id,
        timestamp: new Date().toISOString(),
      });

      // Confirm message sent
      socket.emit("message-sent", {
        message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error in send-message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // User wants to disconnect from current chat
  socket.on("disconnect-chat", async () => {
    try {
      const matchedSocketId = await MatchingService.disconnectUser(socket.id);

      if (matchedSocketId) {
        // Notify the matched user
        io.to(matchedSocketId).emit("partner-disconnected");
        socket.emit("disconnected");
      }
    } catch (error) {
      console.error("Error in disconnect-chat:", error);
    }
  });

  // User disconnects completely
  socket.on("disconnect", async () => {
    try {
      console.log(`User disconnected: ${socket.id}`);
      const matchedSocketId = await MatchingService.disconnectUser(socket.id);

      if (matchedSocketId) {
        // Notify the matched user
        io.to(matchedSocketId).emit("partner-disconnected");
      }

      await MatchingService.removeUserSession(socket.id);
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
};

module.exports = { handleSocketConnection };
