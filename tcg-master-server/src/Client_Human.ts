import { Socket } from "socket.io";
import { Client } from "./Client.js";
import { CommandContext } from "./commands/CommandContext.js";
import { Command, CommandNotFoundError } from "./commands/Command.js";
import { Player } from "./game/state/Player.js";
import { InterruptSync } from "./game/state/interrupts/Interrupt.js";

export class Client_Human extends Client {
    public override name: string = "Pikachu";
    public readonly socket: Socket;

    public constructor(socket: Socket) {
        super();
        this.socket = socket;
        this.socket.emit("NEW");

        socket.on("CMD", (command: string) => {
            console.log(`> [${this.name}] ${command}`);
            try {
                const context = new CommandContext(this, this.player_id!, this.engine!, command);
                const response = Command.execute(context);
                if (response !== undefined) {
                    console.log(`Command ${context.name} responded: ${Client.tokenize(...response).map(t => t.name).join(" ")}`);
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
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    }

    public send(...parts: any[]) {
        this.socket.emit("MSG", Client.tokenize(...parts));
    }

    public error(...parts: any[]) {
        this.socket.emit("ERR", Client.tokenize(...parts));
    }

    public override prompt(interrupt: InterruptSync) {
        const userChoices = interrupt.choices!.map((c, i) => `[${i + 1}] ${c.text}`);
        if (!interrupt.force) {
            userChoices.push("[`] (cancel)");
        }
        this.socket.emit("ASK", {
            text: interrupt.prompt,
            choices: userChoices
        });
    }

    public override wait() {
        this.socket.emit("WAIT");
    }

    public override notify_gameOver(_winner: Player): void {
        this.socket.emit("END");
    }
};
