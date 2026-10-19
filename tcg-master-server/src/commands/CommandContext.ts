import { Game } from "../game/Game.js";
import { Player } from "../game/Player.js";

export class CommandContext {
    public readonly name: string;
    public readonly client: string;
    public readonly game: Game;
    public readonly args: string[];
    public readonly text: string;

    public constructor(client: string, game: Game, caller: string) {
        const tokens = caller.split(" ");
        this.name = tokens[0];
        this.args = tokens.slice(1);
        this.text = caller.includes(" ") ? caller.slice(caller.indexOf(" ") + 1) : "";
        this.client = client;
        this.game = game;
    }

    public get player(): Player {
        return this.game.getPlayer(this.client)!;
    }
};
