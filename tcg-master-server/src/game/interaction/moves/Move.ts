import { Player } from "../../Player.js";
import { IMoveTarget } from "./IMoveTarget.js";

export abstract class Move<T extends IMoveTarget> {
    public readonly player: Player;
    public readonly target: T;

    public constructor(player: Player, target: T) {
        this.player = player;
        this.target = target;
    }

    public abstract execute(): void;
};
