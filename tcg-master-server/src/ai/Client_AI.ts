import { Client } from "../Client.js";
import { InvalidSelectionError, Prompt } from "../game/interaction/prompts/Prompt.js";

export class Client_AI extends Client {
    public send(message: string): void {
        console.log(`${this.player} received a message: ${message}`);
    }
    public error(message: string): void {
        console.error(`${this.player} received an error: ${message}`);
    }
    public prompt(prompt: Prompt | null): void {
        if (prompt) {
            console.log(`${this.player} received a prompt with ${prompt.choices.length} choice(s): ${prompt.text}`);
            const option = Math.floor(Math.random() * (prompt.choices.length ?? 0));
            console.log(`${this.player} responds: ${option + 1}`);
            try {
                prompt.respond(option);
            } catch (e) {
                if (e instanceof InvalidSelectionError) {
                    console.error(`${this.player} selected an invalid option: ${prompt.choices[option]?.text ?? option}`);
                } else {
                    throw e;
                }
            }
        }
    }
};
