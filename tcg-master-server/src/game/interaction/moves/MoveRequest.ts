import { Game } from "../../Game.js";
import { Player } from "../../Player.js";
import { Choice } from "../choices/Choice.js";
import { IMoveTarget } from "./IMoveTarget.js";
import { Move } from "./Move.js";
import { MoveTarget_Cancel } from "./MoveTarget_Cancel.js";

export class MoveRequest<T extends IMoveTarget> {
    public static choices(targets: IMoveTarget[], canCancel: boolean = true): Choice[] {
        const choices = targets.map((t, i) => ({
            key: (i + 1).toString(),
            target: t
        }));
        if (canCancel) {
            choices.push({ key: "c", target: new MoveTarget_Cancel() });
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

    protected get game(): Game {
        return this.player.game;
    }

    public send() {
        this.player.requestMove(this);
    }
};
