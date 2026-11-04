import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Weedle")
export class Card_Pokemon_BaseSet_Weedle extends CardWorker_Pokemon {
    public override readonly name: string = "Weedle";
    public override readonly type: EnergyType = EnergyType.Grass;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Weedle");
    public override readonly hp: number = 40;
    public override readonly weakness = EnergyType.Fire;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Weedle.PoisonSting", "Poison Sting")
            .costs(EnergyType.Grass)
            .deals(10)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Poisoned.")
            .poisons()
            .finalize()
    ];
};
