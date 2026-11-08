import { GameEngine } from "../../../engine/GameEngine.js";
import { GameState } from "../../GameState.js";

export abstract class InterruptWorker {
    public abstract execute(context: InterruptContext, ...args: (number | string | null)[]): boolean;
};

export type InterruptContext = { engine: GameEngine };
