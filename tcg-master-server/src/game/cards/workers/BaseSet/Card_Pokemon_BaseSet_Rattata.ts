import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Rattata")
export class Card_Pokemon_BaseSet_Rattata extends CardWorker_Pokemon {
    public override readonly name: string = "Rattata";
    public override readonly type: EnergyType = EnergyType.Colorless;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Rattata");
    public override readonly hp: number = 30;
    public override readonly weakness: EnergyType | null = EnergyType.Fighting;
    public override readonly resistance = EnergyType.Psychic;
    public override readonly retreatCost: number = 0;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Rattata.Bite", "Bite")
            .costs(EnergyType.Colorless)
            .deals(20)
            .finalize()
    ];
};
