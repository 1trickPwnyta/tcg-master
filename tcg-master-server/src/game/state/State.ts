import { GameEngine } from "../engine/GameEngine.js";
import { Serialize } from "./serializer.js";

export abstract class State {
    @Serialize()
    public readonly id: number;

    protected readonly engine: GameEngine;

    public constructor(id: number, engine: GameEngine) {
        this.id = id;
        this.engine = engine;
    }
};
