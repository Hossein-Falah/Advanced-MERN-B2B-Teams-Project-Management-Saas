export interface ServerToClientEvents {
    notification: (data: {
        id: string;
        type: string;
        sender: string;
        task: string | null;
        comment: string | null;
        createdAt: Date;
    }) => void;
}

export interface ClientToServerEvents {
    "notification:read": (notificationId: string) => void;
}

export interface InterServerEvents { }

export interface SocketData {
    userId: string;
}
