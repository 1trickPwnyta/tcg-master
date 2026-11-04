import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Vulpix")
export class Card_Pokemon_BaseSet_Vulpix extends CardWorker_Pokemon {
    public override readonly name: string = "Vulpix";
    public override readonly type: EnergyType = EnergyType.Fire;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Vulpix;
    public override readonly hp: number = 50;
    public override readonly weakness: EnergyType | null = EnergyType.Water;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Vulpix.ConfuseRay", "Confuse Ray")
            .costs(EnergyType.Fire, EnergyType.Fire)
            .deals(10)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Confused.")
            .confuses()
            .finalize()
    ];
};
