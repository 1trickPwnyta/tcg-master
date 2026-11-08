import { GameEngine } from "../engine/GameEngine.js";

export abstract class State {
    protected readonly engine: GameEngine;

    public constructor(engine: GameEngine) {
        this.engine = engine;
    }
};
