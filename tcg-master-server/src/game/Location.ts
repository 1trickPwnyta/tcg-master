import { Token } from "../Client.js";
import { Card } from "./cards/Card.js";

export class Location<T extends Card> {
    private _cards: T[] = [];

    public get count(): number {
        return this._cards.length;
    }

    public get cards(): T[] {
        return [...this._cards];
    }

    public get empty(): boolean {
        return this.cards.length === 0;
    }

    public add(card: T, position: number = this._cards.length) {
        this._cards.splice(position, 0, card.take() as T);
        card.location = this;
    }

    public addMany(cards: T[], position: number = this._cards.length) {
        cards.forEach(c => this.add(c, position++));
    }

    public take(card: T | number): T | null {
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

    public takeAll(): T[] {
        return this.cards.map(c => this.take(c)!);
    }

    protected swap(pos1: number, pos2: number) {
        const temp = this._cards[pos1];
        this._cards[pos1] = this._cards[pos2];
        this._cards[pos2] = temp;
    }

    public toString(): string {
        return Card.cardString(this.cards);
    }

    public get tokens(): Token[] {
        return Card.cardTokens(this.cards);
    }
};
