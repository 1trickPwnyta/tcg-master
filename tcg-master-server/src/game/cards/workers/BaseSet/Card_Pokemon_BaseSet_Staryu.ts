import { EnergyType } from "../../../EnergyType.js";
import { Attack } from "../../Attack.js";
import { Card_Pokemon, EvolutionStage } from "../../Card_Pokemon.js";
import { EvolutionTree } from "../../EvolutionTree.js";

export class Card_Pokemon_BaseSet_Staryu extends Card_Pokemon {
    public override readonly name: string = "Staryu";
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly stage: EvolutionStage = EvolutionStage.Basic;
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Staryu;
    public override readonly hp: number = 40;
    public override readonly attacks: Attack[] = [ new Attack_Slap(this) ];
    public override readonly weakness: EnergyType | null = EnergyType.Lightning;
    public override readonly retreatCost: number = 1;
}

class Attack_Slap extends Attack {
    public override readonly name: string = "Slap";
    public override readonly cost: EnergyType[] = [ EnergyType.Water ];
    public override readonly damage: number = 20;
}