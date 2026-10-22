import { Player } from "../Player.js";
import { Card } from "./Card.js";
import { TargetSelector } from "./TargetSelector.js";

export abstract class Card_Trainer extends Card {
    public get tokenType(): string {
        return "trainer";
    }

    public abstract readonly text: string;
    protected readonly targetSelector: TargetSelector<Card> | undefined;

    public get player(): Player {
        return this.owner;
    }

    public override play(): void {
        this.take();
        if (this.targetSelector) {
            this.targetSelector.selectTarget();
        } else {
            this.execute();
        }
    }

    protected abstract effect(...targets: Card[]): void;

    public execute(...targets: Card[]) {
        this.game.send(this.owner, "played", this, ".");
        this.effect(...targets);
        this.owner.discard.add(this.take());
    }

    public cancel(): boolean {
        this.owner.hand.add(this.take());
        return false;
    }

    public override getDetails(): any[] {
        return [ this, this.text ];
    }
}