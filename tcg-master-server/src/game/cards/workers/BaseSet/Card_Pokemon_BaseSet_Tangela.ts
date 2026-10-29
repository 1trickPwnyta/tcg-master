import { CardOrientation } from "../../../CardOrientation.js";
import { EnergyType } from "../../../EnergyType.js";
import { Attack } from "../../Attack.js";
import { Card_Pokemon, EvolutionStage } from "../../Card_Pokemon.js";
import { EvolutionTree } from "../../EvolutionTree.js";

export class Card_Pokemon_BaseSet_Tangela extends Card_Pokemon {
    public override readonly name: string = "Tangela";
    public override readonly type: EnergyType = EnergyType.Grass;
    public override readonly stage: EvolutionStage = EvolutionStage.Basic;
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Tangela");
    public override readonly hp: number = 50;
    public override readonly attacks: Attack[] = [ new Attack_Bind(this), new Attack_Poisonpowder(this) ];
    public override readonly weakness: EnergyType | null = EnergyType.Fire;
    public override readonly retreatCost: number = 2;
}

class Attack_Bind extends Attack {
    public override readonly name: string = "Bind";
    public override readonly cost: EnergyType[] = [ EnergyType.Grass, EnergyType.Colorless ];
    public override readonly damage: number = 20;
    public override readonly text: string = "Flip a coin. If heads, the Defending Pokémon is now Paralyzed.";

    protected override postEffect(_attacker: Card_Pokemon, defender: Card_Pokemon): void {
        if (defender.inPlay && this.owner.flipCoin()) {
            defender.orientation = CardOrientation.Paralyzed;
        }
    }
}

class Attack_Poisonpowder extends Attack {
    public override readonly name: string = "Poisonpowder";
    public override readonly cost: EnergyType[] = [ EnergyType.Grass, EnergyType.Grass, EnergyType.Grass ];
    public override readonly damage: number = 20;
    public override readonly text: string = "The Defending Pokémon is now Poisoned.";

    protected override postEffect(_attacker: Card_Pokemon, defender: Card_Pokemon) {
        if (defender.inPlay) {
            defender.poison();
        }
    }
}