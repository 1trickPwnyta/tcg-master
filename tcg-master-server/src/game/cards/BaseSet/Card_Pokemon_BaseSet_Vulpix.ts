import { CardOrientation } from "../../CardOrientation.js";
import { EnergyType } from "../../EnergyType.js";
import { Attack } from "../Attack.js";
import { Card_Pokemon, EvolutionStage } from "../Card_Pokemon.js";
import { EvolutionTree } from "../EvolutionTree.js";

export class Card_Pokemon_BaseSet_Vulpix extends Card_Pokemon {
    public override readonly name: string = "Vulpix";
    public override readonly type: EnergyType = EnergyType.Fire;
    public override readonly stage: EvolutionStage = EvolutionStage.Basic;
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Vulpix;
    public override readonly hp: number = 50;
    public override readonly attacks: Attack[] = [ new Attack_ConfuseRay(this) ];
    public override readonly weakness: EnergyType | null = EnergyType.Water;
    public override readonly retreatCost: number = 1;
}

class Attack_ConfuseRay extends Attack {
    public override readonly name: string = "Confuse Ray";
    public override readonly cost: EnergyType[] = [ EnergyType.Fire, EnergyType.Fire ];
    public override readonly damage: number = 10;
    public override readonly text: string = "Flip a coin. If heads, the Defending Pokémon is now Confused.";

    protected override postEffect(_attacker: Card_Pokemon, defender: Card_Pokemon) {
        if (this.owner.flipCoin()) {
            defender.orientation = CardOrientation.Confused;
        }
    }
}