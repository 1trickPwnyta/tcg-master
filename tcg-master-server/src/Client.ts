import { Player } from "./game/Player.js";
import { Prompt } from "./game/interaction/prompts/Prompt.js";

export abstract class Client {
    protected readonly player: Player;

    public constructor(player: Player) {
        this.player = player;
    }

    public abstract send(message: string): void;

    public abstract error(message: string): void;

    public abstract prompt(prompt: Prompt | null): void;
};
