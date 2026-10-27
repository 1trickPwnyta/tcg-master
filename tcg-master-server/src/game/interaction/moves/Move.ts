import { Player } from "../../Player.js";
import { GameObject } from "../../GameObject.js";

export abstract class Move<T extends GameObject | string | null> {
    public readonly player: Player;
    public readonly target: T;

    public constructor(player: Player, target: T) {
        this.player = player;
        this.target = target;
    }

    public abstract execute(): void;
};
