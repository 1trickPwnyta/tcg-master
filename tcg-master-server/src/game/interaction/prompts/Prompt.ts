import { Player } from "../../Player.js";

export class Prompt {
    private _player!: Player;
    public text: string;
    public choices: Choice[];

    public constructor(text: string, choices: Choice[]) {
        this.text = text;
        this.choices = choices;
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

export class InvalidSelectionError extends Error {
    public constructor() {
        super("Invalid selection.");
    }
}