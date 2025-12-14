const UserSession = require("../models/UserSession");

class MatchingService {
  /**
   * Find a random available user to match with
   * @param {string} socketId - The socket ID of the user looking for a match
   * @returns {Promise<string|null>} - Socket ID of matched user or null
   */
  static async findMatch(socketId) {
    try {
      // Find a user who is waiting and not the current user
      const availableUser = await UserSession.findOne({
        status: "waiting",
        socketId: { $ne: socketId },
      }).sort({ createdAt: 1 }); // Match with oldest waiting user (FIFO)

      if (availableUser) {
        return availableUser.socketId;
      }
      return null;
    } catch (error) {
      console.error("Error finding match:", error);
      return null;
    }
  }

  /**
   * Create or update user session
   * @param {string} socketId - Socket ID of the user
   * @param {string} status - Status of the user (waiting, chatting, disconnected)
   * @param {string|null} matchedWith - Socket ID of matched user
   */
  static async updateUserSession(socketId, status, matchedWith = null) {
    try {
      await UserSession.findOneAndUpdate(
        { socketId },
        {
          socketId,
          status,
          matchedWith,
          createdAt: new Date(), // Reset expiration
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error("Error updating user session:", error);
    }
  }

  /**
   * Get user session
   * @param {string} socketId - Socket ID of the user
   * @returns {Promise<Object|null>} - User session or null
   */
  static async getUserSession(socketId) {
    try {
      return await UserSession.findOne({ socketId });
    } catch (error) {
      console.error("Error getting user session:", error);
      return null;
    }
  }

  /**
   * Remove user session
   * @param {string} socketId - Socket ID of the user
   */
  static async removeUserSession(socketId) {
    try {
      await UserSession.deleteOne({ socketId });
    } catch (error) {
      console.error("Error removing user session:", error);
    }
  }

  /**
   * Disconnect user and notify their match
   * @param {string} socketId - Socket ID of the user disconnecting
   * @returns {Promise<string|null>} - Socket ID of matched user or null
   */
  static async disconnectUser(socketId) {
    try {
      const session = await UserSession.findOne({ socketId });
      if (session && session.matchedWith) {
        const matchedSocketId = session.matchedWith;

        // Update matched user's status
        await UserSession.updateOne(
          { socketId: matchedSocketId },
          { status: "waiting", matchedWith: null }
        );

        // Remove current user's session
        await UserSession.deleteOne({ socketId });

        return matchedSocketId;
      }

      await UserSession.deleteOne({ socketId });
      return null;
    } catch (error) {
      console.error("Error disconnecting user:", error);
      return null;
    }
  }
}

module.exports = MatchingService;
