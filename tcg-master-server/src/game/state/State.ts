import { GameEngine } from "../engine/GameEngine.js";
import { ClientSerialize, Serialize } from "./serializer.js";

export abstract class State {
    @Serialize() @ClientSerialize()
    public readonly id: number;

    public readonly engine: GameEngine;

    public constructor(id: number, engine: GameEngine) {
        this.id = id;
        this.engine = engine;
    }
};
