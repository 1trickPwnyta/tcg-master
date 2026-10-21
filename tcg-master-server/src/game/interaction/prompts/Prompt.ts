import { Player } from "../../Player.js";

export class Prompt {
    private _player!: Player;
    public text: string;
    public choices: Choice[];

    public constructor(text: string, choices: Choice[], options: PromptOptions = {}) {
        this.text = text;
        this.choices = choices;
        if (options.cancelAction) {
            this.choices.push({
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

    public respond(n: number): boolean {
        if (Number.isInteger(n) && n >= 0 && n < this.choices.length) {
            if (this.choices[n].action()) {
                this._player.clearPrompt();
            } else {
                this._player.lastPrompt();
            }
            return true;
        }
        throw new InvalidSelectionError();
    }
};

export type Choice = {
    text: string;
    action: () => boolean;
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