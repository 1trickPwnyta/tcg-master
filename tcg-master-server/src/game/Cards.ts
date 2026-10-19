import { Card } from "./Card.js";

export class Cards {
    protected _cards: Card[] = [];

    public get count(): number {
        return this._cards.length;
    }

    public get cards(): Card[] {
        return [...this._cards];
    }

    public add(card: Card, position: number = this._cards.length) {
        this._cards.splice(position, 0, card);
    }

    public take(card: Card | number): Card | null {
        if (typeof card === "number") {
            if (card < 0 || card >= this._cards.length) {
                return null;
            } else {
                return this._cards.splice(card, 1)[0];
            }
        } else {
            const index = this._cards.indexOf(card);
            if (index === -1) {
                return null;
            } else {
                return this._cards.splice(index, 1)[0];
            }
        }
    }

    public toString(): string {
        return Card.cardString(this.cards);
    }
};
