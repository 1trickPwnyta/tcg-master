import { Socket } from "socket.io";
import { Client, ClientEvent } from "./Client.js";
import { CommandContext } from "./commands/CommandContext.js";
import { Command, CommandNotFoundError } from "./commands/Command.js";
import { Player } from "./game/state/Player.js";
import { InterruptSync } from "./game/state/interrupts/Interrupt.js";
import { CardDef } from "./defs/CardDef.js";
import { ClientSerializationReplace } from "./game/state/serializer.js";

export class Client_Human extends Client {
    public readonly socket: Socket;

    public constructor(socket: Socket) {
        super();
        this.socket = socket;
        this.socket.emit("NEW");

        socket.on("CMD", (command: string) => {
            if (this.player) {
                console.log(`> [${this.player.name}] ${command}`);
                try {
                    const context = new CommandContext(this, this.player_id!, this.engine!, command);
                    const response = Command.execute(context);
                    if (response !== undefined) {
                        console.log(`Command ${context.name} responded: ${Client.tokenize(...response).map(t => t.name).join(" ")}`);
                        socket.emit("INFO", Client.tokenize(...response));
                    }
                } catch (e) {
                    if (e instanceof CommandNotFoundError) {
                        console.log(e.message);
                        this.error(e.message);
                    } else {
                        throw e;
                    }
                }
            }
        });

        socket.on("JOIN", () => {
            if (this.engine?.game) {
                for (const message of this.engine!.game.retrieveMessages()) {
                    this.sendBacklog(message.id, ...message.parts);
                }
                this.sync();
                const interrupt = this.engine!.interrupts.get(this.player_id!);
                if (interrupt) {
                    this.prompt(interrupt);
                }
            }
        });

        socket.on("SYNC", () => this.sync());

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    }

    private sync() {
        if (this.player) {
            const view = this.player.view;
            const payload = JSON.stringify(view, ClientSerializationReplace);
            this.socket.emit("SYNC", payload);
        }
    }

    public override send(id: number, ...parts: any[]) {
        this.socket.emit("MSG", {
            id: id,
            tokens: Client.tokenize(...parts)
        });
    }

    public override sendEvent(event: ClientEvent) {
        this.socket.emit("EVENT", event);
    }

    public override sendInfo(...parts: any[]) {
        this.socket.emit("INFO", Client.tokenize(...parts));
    }

    private sendBacklog(id: number, ...parts: any[]) {
        this.socket.emit("LOG", {
            id: id,
            tokens: Client.tokenize(...parts)
        });
    }

    public override showcase(def: CardDef) {
        this.socket.emit("SHOW", def.graphicPath);
    }

    public override view(def: CardDef) {
        this.socket.emit("VIEW", def.graphicPath);
    }

    public override error(message: string) {
        this.socket.emit("ERR", [ { name: message, type: "error" } ]);
    }

    public override prompt(interrupt: InterruptSync) {
        const userChoices = interrupt.choices!.map((c, i) => ({ option: (i + 1).toString(), parts: Client.tokenize(...c.parts) }));
        if (!interrupt.force) {
            userChoices.push({ option: "`", parts: [ { name: "(cancel)" } ] });
        }
        
        this.socket.emit("ASK", {
            text: Client.tokenize(...interrupt.prompt),
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
