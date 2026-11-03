import { GameEngine } from "../../engine/GameEngine.js";
import { GameState } from "../GameState.js";

export abstract class StateActor {
    protected readonly game: GameEngine;
    protected readonly state: GameState;

    public constructor(game: GameEngine) {
        this.game = game;
        this.state = game.getState();
    }
};
