import { Socket } from "socket.io";
import { io } from "./server";

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
  email: string;
  socketId: string;
}
let users: ActiveUsers[] = [];

const initializeWebSocket = (): void => {
  io.on("connection", (socket: Socket) => {
    const rawCookies: string | undefined = socket.handshake.headers.cookie;
    const userSocketId = socket.id;
    console.log(`User CONNECTED: ${socket.id}`);

    if (rawCookies) {
      try {
        const encodedData = rawCookies.split("user=")[1];
        if (!encodedData) throw new Error("User cookie not found.");
        const decodedData = decodeURIComponent(encodedData);
        const jsonData = decodedData.startsWith("j:")
          ? decodedData.slice(2)
          : decodedData;
        const userObject: UserData = JSON.parse(jsonData);

        const userDataForSocket = {
          email: userObject.email,
          socketId: userSocketId,
        };

        users.push(userDataForSocket);
        socket.emit("active_users", users);
        io.emit("update_active_users", users);
      } catch (error) {
        console.error("Error parsing cookies:", error);
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

      const index = users.findIndex((user) => user.socketId === socket.id);
      if (index !== -1) {
        users.splice(index, 1);
      }

      io.emit("update_active_users", users);
    });
  });
};

export default initializeWebSocket;
