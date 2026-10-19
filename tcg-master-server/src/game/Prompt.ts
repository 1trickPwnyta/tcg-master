import { Player } from "./Player.js";

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
                this._player.prompt = null;
                this._player.game.update();
                return true;
            }
        }
        return false;
    }
};

export type Choice = {
    text: string;
    action: () => boolean;
};
