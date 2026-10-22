import { EnergyType } from "../../EnergyType.js";
import { Attack } from "../Attack.js";
import { Card_Pokemon, EvolutionStage } from "../Card_Pokemon.js";
import { EvolutionTree } from "../EvolutionTree.js";

export class Card_Pokemon_BaseSet_Voltorb extends Card_Pokemon {
    public override readonly name: string = "Voltorb";
    public override readonly type: EnergyType = EnergyType.Lightning;
    public override readonly stage: EvolutionStage = EvolutionStage.Basic;
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Voltorb");
    public override readonly hp: number = 40;
    public override readonly attacks: Attack[] = [ new Attack_Tackle(this) ];
    public override readonly weakness: EnergyType | null = EnergyType.Fighting;
    public override readonly retreatCost: number = 1;
}

class Attack_Tackle extends Attack {
    public override readonly name: string = "Tackle";
    public override readonly cost: EnergyType[] = [ EnergyType.Colorless ];
    public override readonly damage: number = 10;
}