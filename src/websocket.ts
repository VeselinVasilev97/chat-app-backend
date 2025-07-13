import { Socket } from "socket.io";
import { io } from "./server";
import { UsersService } from "./services/users.service";
import { MessagesService } from "./services/messages/messages.service";
import { User } from "./types/user.types";

interface MessageData {
  id: string;
  sender_id: string;
  content: string;
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

const userService = new UsersService();
const messagesService = new MessagesService();

const initializeWebSocket = (): void => {
  io.on("connection", async (socket: Socket) => {
    const rawCookies: string | undefined = socket.handshake.headers.cookie;
    const userSocketId = socket.id;
    //console.log("USER CONNECTED: ", userSocketId);

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
        //console.log(`activeUsers:`,activeUsers);

        // Notify all users about the status update

        updateFriendsStatusForAllUsers(userService);
      } catch (error) {
        console.error("Error parsing cookies or fetching friends:", error);
      }
    } else {
      console.log("No cookies found in the handshake headers.");
      return;
    }

    socket.on(
      "send_message",
      async ({ sender_id, receiver_id, content }: { sender_id: string; receiver_id: string; content: string }) => {
        if (!receiver_id || !content || !sender_id) {
          console.warn("Invalid message: Missing receiver_id or text.");
          return;
        }

        const messageData: MessageData = {
          id: Date.now().toString(),
          sender_id: sender_id,
          content,
          timestamp: new Date().toISOString(),
        };
        const receiver = activeUsers.find((user) => user.userId === receiver_id);
        const receiverSocketId = receiver ? receiver.socketId : null;


        if (!receiverSocketId) {
          await messagesService.saveMessage(sender_id, receiver_id, content, "text");
        } else {
          await messagesService.saveMessage(sender_id, receiver_id, content, "text");
          socket.to(receiverSocketId).emit("new_message", messageData);
        }
      }
    );
    socket.on("requestFriendsListWithStatuses", () => {
      const callerUser = activeUsers.find(user => user.socketId === socket.id);
      if (!callerUser) return;
      updateFriendsStatusForSingleUser(callerUser)
    });

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

const updateFriendsStatusForSingleUser = async (user: any) => {
  console.log(`User: ${user.username} wants info for his friends!`);
  const currentUserFriends = await userService.getAllFriends(user.userId)

  const friendsWithStatusForCurrUser = currentUserFriends.map((friend) => ({
    ...friend,
    isOnline: activeUsers.some(
      (active) => active.userId === friend.user_id
    ),
  }));
  io.to([user.socketId]).emit(
    "friendsListWithStatuses",
    friendsWithStatusForCurrUser);
    console.log(`Server sent friendlist to user:${user.username}`);
    
}

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
