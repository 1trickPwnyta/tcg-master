import { Client } from "../Client.js";
import { Prompt } from "../game/Prompt.js";

export class Client_AI extends Client {
    public send(message: string): void {
        console.log(`${this.player.name} received a message: ${message}`);
    }
    public error(message: string): void {
        console.error(`${this.player.name} received an error: ${message}`);
    }
    public prompt(prompt: Prompt | null): void {
        const option = Math.floor(Math.random() * (prompt?.choices.length ?? 0));
        if (!prompt?.respond(option)) {
            console.error(`${this.player.name} selected an invalid option: ${prompt?.choices[option]?.text ?? option}`);
        }
    }
};
