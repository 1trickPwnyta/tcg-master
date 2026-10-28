import { Client_AI } from "../../ai/Client_AI.js";
import { Client, Token } from "../../Client.js";
import { GameEngine } from "../engine/GameEngine.js";
import { GameObject } from "../GameObject.js";
import { Location } from "../Location.js";
import { Player } from "../Player.js";

export abstract class Card extends GameObject {
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

    public constructor(game: GameEngine, owner: Player) {
        super(game);
        Card.all.push(this);
        this.owner = owner;
    }

    public get label(): string {
        return this.toString();
    }

    public take(): Card {
        this.location?.take(this);
        this.location = null;
        return this;
    }

    public discard() {
        this.owner.discard.add(this.take());
    }

    public get unplayableReason(): string | null {
        return null;
    }

    public abstract play(): void;

    public toString(): string {
        return this.name;
    }

    public abstract getDetails(): any[];

    public override copy(_requester: Client_AI, game: GameEngine): this {
        const card = new (this.constructor as new (game: GameEngine, owner: Player) => this)(game, game.players[this.owner.id]);
        if (this.location) {
            card.location = game.getObject(this.location.id) as Location<Card>;
        }
        return card;
    }
};
