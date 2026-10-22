import { Card } from "../Card.js";
import { Card_Pokemon } from "../Card_Pokemon.js";
import { Card_Trainer } from "../Card_Trainer.js";
import { ITargeter } from "../ITargeter.js";
import { TargetSelector } from "../TargetSelector.js";

export class Card_Trainer_BaseSet_Switch extends Card_Trainer implements ITargeter<Card_Pokemon> {
    public override readonly name: string = "Switch";
    public override readonly text: string = "Switch 1 of your own Benched Pokémon with your Active Pokémon.";
    protected override readonly targetSelector: TargetSelector<Card> | undefined = new TargetSelector<Card_Pokemon>(this);

    public get prompt(): string {
        return `Switch ${this.owner.active.single} with which Pokémon?`;
    }

    public get choices(): Card_Pokemon[] {
        return this.owner.bench.cards;
    }

    protected override effect(benched: Card_Pokemon) {
        this.owner.active.single!.switch(benched);
        this.game.send(this.owner, "sent out", benched, ".");
    }
};
