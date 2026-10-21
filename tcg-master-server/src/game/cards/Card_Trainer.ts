import { Card } from "./Card.js";

export abstract class Card_Trainer extends Card {
    public get tokenType(): string {
        return "trainer";
    }

    public abstract readonly text: string;

    public override play(): void {
        this.game.send(this.owner, "played", this, ".");
        if (this.execute()) {
            this.owner.discard.add(this.take());
        }
    }

    protected abstract execute(): boolean;

    public override getDetails(): string {
        return `${this.name}
${this.text}
`;
    }
}