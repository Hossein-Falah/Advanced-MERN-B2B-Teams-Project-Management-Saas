import { Server } from "socket.io";
import UserModel from "../modules/user/user.model";

export let io: Server;

export const registerSocket = (server: any) => {
    io = new Server(server, {
        cors: { 
            origin: "*", 
            credentials: true
        },
        transports: ["websocket"],
    });

    io.use((socket, next) => {
        console.log("auth data:", socket.handshake.auth);

        const userId = socket.handshake.auth.userId;

        if (!userId) return next(new Error("Unauthorized"));

        socket.data.userId = userId;

        next();
    });

    io.on("connection", async (socket) => {
        console.log("Socket connected:", socket.id);

        const userId = socket.data.userId;

        await UserModel.findByIdAndUpdate(userId, {
            isOnline: true
        });

        socket.join(`user:${userId}`);

        console.log(`User ${userId} joined room user:${userId}`);

        socket.on("disconnect", async () => {
            console.log("Socket disconnected:", socket.id);

            await UserModel.findByIdAndUpdate(userId, {
                isOnline: false,
                lastSeen: new Date(),
            });
        });
    });

    return io;
};
