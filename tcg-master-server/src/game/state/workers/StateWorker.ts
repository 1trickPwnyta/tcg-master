import { GameEngine } from "../../engine/GameEngine.js";
import { GameState } from "../GameState.js";

export abstract class StateWorker {
    public abstract execute(context: StateContext, ...args: (string | null)[]): boolean;
};

export type StateContext = { game: GameEngine, state: GameState };
