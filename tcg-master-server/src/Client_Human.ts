import { Socket } from "socket.io";
import { Client } from "./Client.js";
import { Player } from "./game/Player.js";
import { CommandContext } from "./commands/CommandContext.js";
import { Command, CommandNotFoundError } from "./commands/Command.js";
import { Client_HumanSimulator } from "./ai/Client_HumanSimulator.js";
import { MoveRequest } from "./game/interaction/moves/MoveRequest.js";

export class Client_Human extends Client {
    public readonly socket: Socket;

    public constructor(socket: Socket, player: Player) {
        super(player);
        this.socket = socket;
        this.socket.emit("NEW");

        socket.on("CMD", (command: string) => {
            console.log(`Received command from ${player.name ?? "(unknown)"}: ${command}`);
            try {
                const context = new CommandContext(socket.id, player.game, command);
                const response = Command.execute(context);
                if (response !== undefined) {
                    console.log(`Command ${context.name} responded: ${response.join(" ")}`);
                    socket.emit("MSG", Client.tokenize(...response));
                }
            } catch (e) {
                if (e instanceof CommandNotFoundError) {
                    console.log(e.message);
                    this.error(e.message);
                } else {
                    throw e;
                }
            }
            player.prompt?.send();
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    }

    public send(...parts: any[]) {
        this.socket.emit("MSG", Client.tokenize(...parts));
    }

    public error(message: string) {
        this.socket.emit("ERR", message);
    }

    public requestMove(request: MoveRequest) {
        this.socket.emit("ASK", {
            text: request.prompt,
            choices: request.choices.map(c => `[${c.key!}] ${c.target.label}`)
        });
    }

    public override copy(player: Player): Client {
        return new Client_HumanSimulator(player);
    }
};
