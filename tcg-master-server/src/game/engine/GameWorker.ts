import { GameState } from "../state/GameState.js";
import { GameEngine } from "./GameEngine.js";

export abstract class GameWorker {
    protected readonly game: GameEngine;
    
    public constructor(game: GameEngine) {
        this.game = game;
    }

    protected get state(): GameState {
        return this.game.getState();
    }
};
