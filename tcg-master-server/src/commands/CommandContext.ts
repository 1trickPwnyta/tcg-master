import { Client } from "../Client.js";
import { GameEngine } from "../game/engine/GameEngine.js";

export class CommandContext {
    public name: string;
    public client: Client;
    public readonly player_id: number;
    public readonly engine: GameEngine;
    public args: string[];

    public constructor(client: Client, player_id: number, game: GameEngine, caller: string) {
        const tokens = caller.split(" ");
        this.name = tokens[0];
        this.args = tokens.slice(1);
        this.client = client;
        this.player_id = player_id;
        this.engine = game;
    }

    public get text(): string {
        return this.args.join(" ");
    }
};
