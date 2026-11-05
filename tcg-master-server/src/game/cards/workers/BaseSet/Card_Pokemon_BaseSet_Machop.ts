import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Machop")
export class Card_Pokemon_BaseSet_Machop extends CardWorker_Pokemon {
    public override readonly name: string = "Machop";
    public override readonly type: EnergyType = EnergyType.Fighting;
    public override readonly stage = "basic";
    public override readonly evolutionTree = new EvolutionTree("Machop");
    public override readonly hp: number = 50;
    public override readonly weakness = EnergyType.Psychic;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Machop.LowKick", "Low Kick")
            .costs(EnergyType.Fighting)
            .deals(20)
            .finalize()
    ];
};
