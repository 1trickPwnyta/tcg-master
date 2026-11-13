import { GameEngine } from "../../../engine/GameEngine.js";

export abstract class InterruptWorker {
    public abstract execute(context: InterruptContext, ...args: (number | string | null)[]): boolean;
};

export type InterruptContext = {
    engine: GameEngine;
    compoundArgs?: any;
};
