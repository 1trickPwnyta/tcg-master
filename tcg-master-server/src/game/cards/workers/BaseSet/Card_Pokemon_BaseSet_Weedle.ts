import { EnergyType } from "../../../EnergyType.js";
import { Attack } from "../../Attack.js";
import { Card_Pokemon, EvolutionStage } from "../../Card_Pokemon.js";
import { EvolutionTree } from "../../EvolutionTree.js";

export class Card_Pokemon_BaseSet_Weedle extends Card_Pokemon {
    public override readonly name: string = "Weedle";
    public override readonly type: EnergyType = EnergyType.Grass;
    public override readonly stage: EvolutionStage = EvolutionStage.Basic;
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Weedle");
    public override readonly hp: number = 40;
    public override readonly attacks: Attack[] = [ new Attack_PoisonSting(this) ];
    public override readonly weakness: EnergyType | null = EnergyType.Fire;
    public override readonly retreatCost: number = 1;
}

class Attack_PoisonSting extends Attack {
    public override readonly name: string = "Poison Sting";
    public override readonly cost: EnergyType[] = [ EnergyType.Grass ];
    public override readonly damage: number = 10;
    public override readonly text: string = "Flip a coin. If heads, the Defending Pokémon is now Poisoned.";

    protected override postEffect(_attacker: Card_Pokemon, defender: Card_Pokemon) {
        if (defender.inPlay && this.owner.flipCoin()) {
            defender.poison();
        }
    }
}