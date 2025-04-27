import { Socket } from "socket.io";
import { io } from "./server";
import { UsersService } from "./services/users.service";

interface MessageData {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface UserData {
  user_id: string;
  username: string;
  email: string;
  profile_picture_url: string | null;
  status: string;
}

interface ActiveUsers {
  userId: string;
  username: string;
  socketId: string;
}

let activeUsers: ActiveUsers[] = [];

const initializeWebSocket = (): void => {
  io.on("connection", async (socket: Socket) => {
    const rawCookies: string | undefined = socket.handshake.headers.cookie;
    const userSocketId = socket.id;
    console.log("USER CONNECTED: ", userSocketId);

    const userService = new UsersService();

    if (rawCookies) {
      try {
        const encodedData = rawCookies.split("user=")[1];
        if (!encodedData) throw new Error("User cookie not found.");
        const decodedData = decodeURIComponent(encodedData);
        const jsonData = decodedData.startsWith("j:")
          ? decodedData.slice(2)
          : decodedData;
        const userObject: UserData = JSON.parse(jsonData);

        // Add user to activeUsers list
        const userDataForSocket = {
          userId: userObject.user_id,
          username: userObject.username,
          socketId: userSocketId,
        };

        // Remove old socket entry for the same user
        activeUsers = activeUsers.filter(
          (user) => user.userId !== userObject.user_id
        );

        // Add the updated socket entry
        activeUsers.push(userDataForSocket);
        console.log(`activeUsers:`,activeUsers);

        // Notify all users about the status update
        updateFriendsStatusForAllUsers(userService);
      } catch (error) {
        console.error("Error parsing cookies or fetching friends:", error);
      }
    } else {
      console.log("No cookies found in the handshake headers.");
    }

    socket.on(
      "send_message",
      ({ receiverId, text }: { receiverId: string; text: string }) => {
        if (!receiverId || !text) {
          console.warn("Invalid message: Missing receiverId or text.");
          return;
        }

        const messageData: MessageData = {
          id: Date.now().toString(),
          senderId: socket.id,
          text,
          timestamp: new Date().toISOString(),
        };

        socket.to(receiverId).emit("new_message", messageData);
        console.log(`Private message from ${socket.id} to ${receiverId}`);
      }
    );

    socket.on("disconnect", () => {
      console.log(`User DISCONNECTED: ${socket.id}`);

      // Remove the user from activeUsers
      const index = activeUsers.findIndex(
        (user) => user.socketId === socket.id
      );
      if (index !== -1) {
        activeUsers.splice(index, 1);
      }

      // Notify all users about the status update
      updateFriendsStatusForAllUsers(userService);
    });
  });
};

/**
 * Sends updated friends list with statuses to all active users.
 */
const updateFriendsStatusForAllUsers = async (userService: UsersService) => {
  for (const activeUser of activeUsers) {
    try {
      const currentUserFriends = await userService.getAllFriends(
        activeUser.userId
      );

      const friendsWithStatus = currentUserFriends.map((friend) => ({
        ...friend,
        isOnline: activeUsers.some(
          (active) => active.userId === friend.user_id
        ),
      }));

      // Send updated friend list to the user
      io.to(activeUser.socketId).emit(
        "friendsListWithStatuses",
        friendsWithStatus
      );
    } catch (error) {
      console.error(
        `Error updating friend list for user ${activeUser.userId}:`,
        error
      );
    }
  }
};

export default initializeWebSocket;
