import { Game } from "../../Game.js";
import { Player } from "../../Player.js";
import { Choice } from "../choices/Choice.js";
import { GameObject } from "../../GameObject.js";
import { Move } from "./Move.js";

export class MoveRequest<T extends GameObject | string | null> {
    public static choices<T extends GameObject | string>(targets: T[], canCancel: boolean = true): Choice[] {
        const choices: Choice[] = targets.map((t, i) => ({
            key: (i + 1).toString(),
            label: t instanceof GameObject ? t.label : t.toString(),
            id: t instanceof GameObject ? t.id : t.toString()
        }));
        if (canCancel) {
            choices.push({ key: "c", label: "(cancel)", id: "cancel" });
        }
        return choices;
    }

    public readonly type: new (player: Player, target: T) => Move<T>;
    public readonly player: Player;
    public readonly prompt: string;
    public readonly choices: Choice[];

    public constructor(type: new (player: Player, target: T) => Move<T>, player: Player, prompt: string, choices: Choice[]) {
        this.type = type;
        this.player = player;
        this.prompt = prompt;
        this.choices = choices;
    }

    public send() {
        if (this.choices.length) {
            this.player.requestMove(this);
        }
    }

    public copy(game: Game): MoveRequest<T> {
        return new MoveRequest(this.type, game.players[this.player.id], this.prompt, this.choices);
    }
};
