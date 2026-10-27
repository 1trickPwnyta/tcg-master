import { Client_AI } from "../ai/Client_AI.js";
import { Game } from "./Game.js";

export abstract class GameObject {
    public id: string = "";
    public readonly game: Game;

    public constructor(game: Game) {
        this.game = game;
        game.registerObject(this);
    }

    public get label(): string {
        return this.toString();
    }

    public branch(requester: Client_AI, game: Game): this {
        const copy = this.copy(requester, game);
        game.registerObject(copy, this.id);
        return copy;
    }

    protected abstract copy(requester: Client_AI, game: Game): this;
};
