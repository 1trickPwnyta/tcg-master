import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Ponyta")
export class Card_Pokemon_BaseSet_Ponyta extends CardWorker_Pokemon {
    public override readonly name: string = "Ponyta";
    public override readonly type: EnergyType = EnergyType.Fire;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Ponyta");
    public override readonly hp: number = 40;
    public override readonly weakness: EnergyType | null = EnergyType.Water;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Ponyta.SmashKick", "Smash Kick")
            .costs(EnergyType.Colorless, EnergyType.Colorless)
            .deals(20)
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Ponyta.FlameTail", "Flame Tail")
            .costs(EnergyType.Fire, EnergyType.Fire)
            .deals(30)
            .finalize()
    ];
};
