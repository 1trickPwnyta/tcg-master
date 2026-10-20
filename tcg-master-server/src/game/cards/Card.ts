import { Game } from "../Game.js";
import { Location } from "../Location.js";
import { Player } from "../Player.js";

export abstract class Card {
    public static cardString(cards: Card[]): string {
        return cards.length ? cards.map(c => `[${c.name}]`).join(" ") : "(empty)";
    }

    public abstract readonly name: string;
    public readonly owner: Player;
    public location: Location<Card> | null = null;

    public constructor(owner: Player) {
        this.owner = owner;
    }

    public get game(): Game {
        return this.owner.game;
    }

    public take(): Card {
        return this.location?.take(this) ?? this;
    }

    public abstract play(): void;

    public toString(): string {
        return this.name;
    }
};
