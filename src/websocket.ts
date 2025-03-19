import { io } from './server';

const initializeWebSocket = () => {
    io.on("connection", (socket) => {
        console.log(socket.id, "connected");
        
        socket.on("send_message", ({ receiverId, text }) => {
            const messageData = {
                id: Date.now().toString(),
                senderId: socket.id,
                text,
                timestamp: new Date().toISOString()
            };
            
            // Send only to the specified receiver
            socket.to(receiverId).emit("new_message", messageData);
            
            console.log(`Private message from ${socket.id} to ${receiverId}`);
        });

        socket.on("disconnect", () => {
            console.log(socket.id, "disconnected");
            // Add any cleanup logic here if needed
        });
    });
}

export default initializeWebSocket;