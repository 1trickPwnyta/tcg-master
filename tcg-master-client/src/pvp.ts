import { io, Socket } from "socket.io-client";
import { Storage } from "./storage";

export class PvP {
    public static match(callback: (socket: Socket) => void) {
        const socket = io("http://localhost:3000", {
            timeout: 600000,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000
        });
        socket.emit("START", {
            name: Storage.User!.name,
            opponent: "human"
        });
        socket.on("MATCH", () => callback(socket));
    }
};
