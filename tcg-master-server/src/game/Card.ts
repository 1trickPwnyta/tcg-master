export abstract class Card {
    public static cardString(cards: Card[]): string {
        return cards.length ? cards.map(c => `[${c.name}]`).join(" ") : "(empty)";
    }

    public abstract readonly name: string;

    public toString(): string {
        return this.name;
    }
};
