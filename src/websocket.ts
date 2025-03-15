import { io } from './server';

const initializeWebSocket = () => {
    io.on("connection", (socket) => {
        const xForwardedFor = socket.handshake.address;
        console.log(xForwardedFor);
        
        const cookies = socket.request.headers.cookie;




        socket.on("disconnect", () => {

        });
    });
}

export default initializeWebSocket;