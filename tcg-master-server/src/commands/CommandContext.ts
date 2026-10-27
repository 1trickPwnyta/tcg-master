import { Client } from "../Client.js";
import { Game } from "../game/Game.js";

export class CommandContext {
    public name: string;
    public client: Client;
    public readonly player_id: string;
    public readonly game: Game;
    public args: string[];

    public constructor(client: Client, player_id: string, game: Game, caller: string) {
        const tokens = caller.split(" ");
        this.name = tokens[0];
        this.args = tokens.slice(1);
        this.client = client;
        this.player_id = player_id;
        this.game = game;
    }

    public get text(): string {
        return this.args.join(" ");
    }
};
