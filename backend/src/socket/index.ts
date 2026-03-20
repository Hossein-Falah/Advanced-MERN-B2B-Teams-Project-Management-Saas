import { Server } from "socket.io";

export let io: Server;

export const registerSocket = (server: any) => {
    io = new Server(server, {
        cors: { origin: "*" },
        transports: ["websocket"]
    });

    io.use((socket, next) => {
        console.log("auth data:", socket.handshake.auth);
    
        const userId = socket.handshake.auth.userId;
    
        if (!userId) return next(new Error("Unauthorized"));
    
        socket.data.userId = userId;
    
        next();
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
    
        const userId = socket.data.userId;
    
        socket.join(`user:${userId}`);
    
        console.log(`User ${userId} joined room user:${userId}`);

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });    

    return io;
};
