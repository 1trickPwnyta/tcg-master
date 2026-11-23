import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { GameEngine } from "./game/engine/GameEngine.js";
import { Command } from "./commands/Command.js";
import { Command_check } from "./commands/Command_check.js";
import { Command_select } from "./commands/Command_select.js";
import { Client_Human } from "./Client_Human.js";
import { Command_debug } from "./commands/Command_debug.js";
import { Client } from "./Client.js";

export class Input {
    static {
        Command.default = new Command_select();
        Command.register(Command.default);
        Command.register(new Command_check());
        Command.register(new Command_debug());
    }

    public static init(server: HttpServer, cors: { origin: string; methods: string[]; credentials: boolean }) {
        const io = new Server(server, { cors: cors });
        const matchQueue: { name: string, socket: Socket}[] = [];

        io.on("connection", (socket: Socket) => {
            console.log(`Client connected: ${socket.id}`);
            socket.on("START", (args: { name: string, opponent: "com" | "human" }) => {
                if (args.opponent === "com") {
                    Input.startGame(args.name, new Client_Human(socket), "COM");
                } else if (args.opponent === "human") {
                    if (matchQueue.length) {
                        const match = matchQueue.splice(0, 1)[0];
                        console.log(`Matched ${args.name} with ${match.name}. Queue: ${matchQueue.map(q => q.name).join(", ")}`);
                        match.socket.emit("MATCH");
                        socket.emit("MATCH");
                        Input.startGame(match.name, new Client_Human(match.socket), args.name, new Client_Human(socket));
                    } else {
                        matchQueue.push({ name: args.name, socket: socket });
                        console.log(`Added ${args.name} to match queue. Queue: ${matchQueue.map(q => q.name).join(", ")}`);
                    }
                }
            });
        });
    }

    private static startGame(name1: string, client1: Client, name2: string, client2?: Client) {
        setTimeout(() => {
            const engine = new GameEngine(client1, client2);
            engine.start(name1, name2);
        }, 1000); // Wait a second to allow clients to join before the game begins, if they don't nbd
    }
};
