import { Client } from "../Client.js";
import { Prompt } from "../game/interaction/prompts/Prompt.js";
import { Player } from "../game/Player.js";

export class Client_HumanSimulator extends Client {
    public send(...parts: any[]): void { }

    public error(message: string): void { }

    protected sendPrompt(prompt: Prompt | null): void {
        throw new Error("Method not implemented.");
    }

    public copy(player: Player): Client {
        return new Client_HumanSimulator(player);
    }
    
}