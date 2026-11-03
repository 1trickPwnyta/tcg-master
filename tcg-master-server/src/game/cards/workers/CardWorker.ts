import { GameEngine } from "../../engine/GameEngine.js";
import { CardState } from "../../state/CardState.js";
import { GameState } from "../../state/GameState.js";
import { PlayerState } from "../../state/PlayerState.js";

export abstract class CardWorker {
    public dbid: string = "";
    public abstract readonly name: string;
    public abstract readonly kind: "pokemon" | "trainer" | "energy";

    public abstract play(context: PlayContext): boolean;
    public abstract getDetails(): any[];
};

export type PlayContext = {
    game: GameEngine;
    state: GameState;
    player: PlayerState;
    card: CardState;
};