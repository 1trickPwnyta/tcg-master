import { Player } from "../../Player.js";

export class Prompt {
    private _player!: Player;
    public text: string;
    public choices: Choice[];

    public constructor(text: string, choices: Choice[], options: PromptOptions = {}) {
        this.text = text;
        this.choices = choices;

        let i = 1;
        for (const choice of this.choices) {
            if (!choice.key) {
                choice.key = (i++).toString();
            }
        }

        if (options.cancelAction) {
            this.choices.push({
                key: "c",
                text: "(cancel)",
                action: options.cancelAction
            });
        }
    }

    public set player(player: Player) {
        this._player = player;
    }

    public send() {
        this._player.client?.prompt(this);
    }

    public respond(response: string): boolean {
        const choice = this.choices.find(c => c.key === response);
        if (choice) {
            if (choice.action()) {
                this._player.clearPrompt();
            } else {
                this._player.lastPrompt();
            }
            return true;
        }
        throw new InvalidSelectionError();
    }
};

export type PromptOptions = {
    cancelAction?: () => boolean;
};

export class InvalidSelectionError extends Error {
    public readonly tokenType: string = "error";

    public constructor() {
        super("Invalid selection.");
    }
}