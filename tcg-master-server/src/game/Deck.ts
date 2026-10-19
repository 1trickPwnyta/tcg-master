import { Card } from "./card.js";
import { Cards } from "./Cards.js";
import { Player } from "./Player.js";

export class Deck extends Cards {
    private player: Player;

    public constructor(player: Player) {
        super();
        this.player = player;
    }

    public add(card: Card) {
        this._cards.push(card);
    }

    public fill<T extends Card>(cards: { card: new () => T; qty: number }[]) {
        cards.forEach(c => {
            this._cards = [ ...this._cards as Card[], ...Array(c.qty).fill(new c.card()) ];
        });
    }

    public draw(): Card {
        if (!this._cards.length) {
            throw new DeckDrawError();
        }
        return this._cards.pop() as Card;
    }

    public shuffle() {
        for (let i = this._cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this._cards[i];
            this._cards[i] = this._cards[j];
            this._cards[j] = temp;
        }
        this.player.game.send(`${this.player.name} shuffled ${this.player.pronoun.possessive} deck.`);
    }
};

export class DeckDrawError extends Error {
    public constructor() {
        super("Deck empty. Cannot draw.");
    }
};
