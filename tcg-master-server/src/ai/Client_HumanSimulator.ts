import { Client } from "../Client.js";
import { Choice } from "../game/state/Interrupt.js";

export class Client_HumanSimulator extends Client {
    public readonly name: string;

    public constructor(name: string) {
        super();
        this.name = name;
    }
    
    public override async prompt(_text: string, choices: Choice[], force?: boolean, callback?: () => void) {
        const choice = Math.floor(Math.random() * choices.length);
        const finalChoice = !force && Math.random() < 0.1 ? null : choice;
        this.game!.resolveInterrupt(this.player_id!, finalChoice, callback);
    }

    public send(..._parts: any[]): void { }

    public error(..._parts: any[]): void { }
};
