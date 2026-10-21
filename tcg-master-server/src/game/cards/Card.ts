import { Client, Token } from "../../Client.js";
import { Game } from "../Game.js";
import { Location } from "../Location.js";
import { Player } from "../Player.js";

export abstract class Card {
    public static readonly all: Card[] = [];

    public static cardString(cards: Card[]): string {
        return cards.length ? cards.map(c => `[${c.name}]`).join(" ") : "(empty)";
    }

    public static cardTokens(cards: Card[]): Token[] {
        if (cards.length) {
            return Client.tokenize(...cards).map(t => t.setText(`[${t.text}]`));
        } else {
            return Client.tokenize("(empty)");
        }
    }

    public abstract readonly name: string;
    public readonly owner: Player;
    public location: Location<Card> | null = null;

    public constructor(owner: Player) {
        Card.all.push(this);
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

    public abstract getDetails(): any[];
};
