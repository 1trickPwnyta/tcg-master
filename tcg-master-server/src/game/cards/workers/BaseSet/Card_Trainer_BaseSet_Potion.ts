import { Card } from "../../Card.js";
import { Card_Pokemon } from "../../Card_Pokemon.js";
import { Card_Trainer } from "../../Card_Trainer.js";
import { ITargeter } from "../../ITargeter.js";
import { TargetSelector } from "../../TargetSelector.js";

export class Card_Trainer_BaseSet_Potion extends Card_Trainer implements ITargeter<Card_Pokemon> {
    public override readonly name: string = "Potion";
    public override readonly text: string = "Remove 2 damage counters from 1 of your Pokémon (1 if that Pokémon has only 1).";
    protected override targetSelector: TargetSelector<Card> = new TargetSelector<Card_Pokemon>(this);

    public get prompt(): string {
        return "Use Potion on which Pokémon?";
    }

    public get choices(): Card_Pokemon[] {
        return this.owner.allPokemonInPlay.filter(p => p.damageCounters);
    }

    protected override effect(target: Card_Pokemon) {
        target.healDamage(20);
    }
};
