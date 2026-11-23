import { io, Socket } from "socket.io-client";
import { Storage } from "./storage";
import config from "../config.json" with { type: "json" };

export class PvP {
    public static match(callback: (socket: Socket) => void) {
        const socket = io(config.server, {
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
