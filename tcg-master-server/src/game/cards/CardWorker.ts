import { GameEngine } from "../engine/GameEngine.js";
import { CardState } from "../state/CardState.js";
import { GameState } from "../state/GameState.js";

export abstract class CardWorker {
    public abstract readonly dbid: string;
    public abstract readonly name: string;

    public abstract play(context: PlayContext): void;
};

export type PlayContext = {
    game: GameEngine;
    state: GameState;
    card: CardState;
};