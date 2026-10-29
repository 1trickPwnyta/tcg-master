import { CardOrientation } from "../../../CardOrientation.js";
import { EnergyType } from "../../../EnergyType.js";
import { Attack } from "../../Attack.js";
import { Card } from "../../Card.js";
import { Card_Energy } from "../../Card_Energy.js";
import { Card_Pokemon, EvolutionStage } from "../../Card_Pokemon.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { ITargeter } from "../../ITargeter.js";
import { TargetSelector } from "../../TargetSelector.js";

export class Card_Pokemon_BaseSet_Starmie extends Card_Pokemon {
    public override readonly name: string = "Starmie";
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly stage: EvolutionStage = EvolutionStage.Stage1;
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Staryu;
    public override readonly hp: number = 60;
    public override readonly attacks: Attack[] = [ new Attack_Recover(this), new Attack_StarFreeze(this) ];
    public override readonly weakness: EnergyType | null = EnergyType.Lightning;
    public override readonly retreatCost: number = 1;
}

class Attack_Recover extends Attack implements ITargeter<Card_Energy> {
    public override readonly name: string = "Recover";
    public override readonly cost: EnergyType[] = [ EnergyType.Water, EnergyType.Water ];
    public override readonly damage: number = 0;
    public override readonly text: string = `Discard 1 ${EnergyType.Water} Energy card attached to Starmie in order to use this attack. Remove all damage counters from Starmie.`;
    protected override readonly targetSelector: TargetSelector<Card> = new TargetSelector<Card_Energy>(this);

    public get prompt(): string {
        return `Select a ${EnergyType.Water} energy card to discard from ${this.parent}.`;
    }

    public get choices(): Card_Energy[] {
        return this.parent.energy.cards.filter(c => c.type == EnergyType.Water);
    }

    protected override preEffect(energy: Card_Energy): number {
        energy.discard();
        return 0;
    }

    protected override postEffect() {
        this.parent.healDamage(this.parent.damage);
    }
}

class Attack_StarFreeze extends Attack {
    public override readonly name: string = "Star Freeze";
    public override readonly cost: EnergyType[] = [ EnergyType.Water, EnergyType.Colorless, EnergyType.Colorless ];
    public override readonly damage: number = 20;
    public override readonly text: string = "Flip a coin. If heads, the Defending Pokémon is now Paralyzed.";

    protected override postEffect(_attacker: Card_Pokemon, defender: Card_Pokemon) {
        if (defender.inPlay && this.owner.flipCoin()) {
            defender.orientation = CardOrientation.Paralyzed;
        }
    }
}