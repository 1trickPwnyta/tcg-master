import { Card } from "./cards/Card.js";
import { Location } from "./Location.js";
import { Player } from "./Player.js";

export class Deck extends Location<Card> {
    private player: Player;

    public constructor(player: Player) {
        super();
        this.player = player;
    }

    public fill<T extends Card>(cards: { card: new (owner: Player) => T; qty: number }[]) {
        cards.forEach(c => {
            for (let i = 0; i < c.qty; i++) {
                this.add(new c.card(this.player));
            }
        });
    }

    public draw(): Card {
        if (this.empty) {
            throw new DeckDrawError();
        }
        return this.take(this.count - 1)!;
    }

    public shuffle() {
        for (let i = this.count - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            this.swap(i, j);
        }
        this.player.game.send(`${this.player.name} shuffled ${this.player.pronoun.possessive} deck.`);
    }
};

export class DeckDrawError extends Error {
    public constructor() {
        super("Deck empty. Cannot draw.");
    }
};
