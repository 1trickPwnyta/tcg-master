import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Caterpie")
export class Card_Pokemon_BaseSet_Caterpie extends CardWorker_Pokemon {
    public override readonly name: string = "Caterpie";
    public override readonly type: EnergyType = EnergyType.Grass;
    public override readonly stage = "basic";
    public override readonly evolutionTree = EvolutionTree.Caterpie;
    public override readonly hp: number = 40;
    public override readonly weakness = EnergyType.Fire;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Caterpie.StringShot", "String Shot")
            .costs(EnergyType.Grass)
            .deals(10)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Paralyzed.")
            .paralyzes()
            .finalize()
    ];
};
