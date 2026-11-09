import { Game } from "../state/Game.js";
import { GameEngine } from "./GameEngine.js";

export abstract class SubEngine {
    protected readonly engine: GameEngine;
    
    public constructor(game: GameEngine) {
        this.engine = game;
    }

    protected get state(): Game {
        return this.engine.game;
    }
};
