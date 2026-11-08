import { GameEngine } from "../../engine/GameEngine.js";
import { CardState } from "../../state/CardState.js";
import { PlayerState } from "../../state/PlayerState.js";

export abstract class CardWorker {
    public dbid: string = "";
    public abstract readonly name: string;
    public abstract readonly kind: "pokemon" | "trainer" | "energy";

    public abstract play(context: PlayContext): boolean;
    public abstract getDetails(): any[];
};

export type PlayContext = {
    engine: GameEngine;
    player: PlayerState;
    card: CardState;
};