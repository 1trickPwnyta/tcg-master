import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { GameEngine } from "./game/engine/GameEngine.js";
import { Command } from "./commands/Command.js";
import { Command_check } from "./commands/Command_check.js";
import { Command_select } from "./commands/Command_select.js";
import { Client_Human } from "./Client_Human.js";
import { Client_AI } from "./ai/Client_AI.js";

export class Input {
    static {
        Command.default = new Command_select();
        Command.register(Command.default);
        Command.register(new Command_check());
    }

    public static init(server: HttpServer, cors: { origin: string; methods: string[]; credentials: boolean }) {
        const io = new Server(server, { cors: cors });

        io.on("connection", (socket: Socket) => {
            console.log(`Client connected: ${socket.id}`);
            new GameEngine(new Client_Human(socket));
        });
    }
};
