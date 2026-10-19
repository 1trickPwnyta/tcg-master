import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { Game } from "./game/Game.js";
import { Command } from "./commands/Command.js";
import { Command_check } from "./commands/Command_check.js";
import { Command_select } from "./commands/Command_select.js";

export class Input {
    static {
        Command.register(new Command_check());
        Command.register(new Command_select());
    }

    public static init(server: HttpServer, cors: { origin: string; methods: string[]; credentials: boolean }) {
        const io = new Server(server, { cors: cors });

        io.on("connection", (socket: Socket) => {
            console.log(`Client connected: ${socket.id}`);
            Game.new(socket).start();
        });
    }
};
