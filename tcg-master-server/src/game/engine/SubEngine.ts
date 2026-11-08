import { GameState } from "../state/GameState.js";
import { GameEngine } from "./GameEngine.js";

export abstract class SubEngine {
    protected readonly engine: GameEngine;
    
    public constructor(game: GameEngine) {
        this.engine = game;
    }

    protected get state(): GameState {
        return this.engine.state;
    }
};
