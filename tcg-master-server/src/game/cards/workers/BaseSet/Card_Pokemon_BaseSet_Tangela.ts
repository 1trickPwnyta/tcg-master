import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Tangela")
export class Card_Pokemon_BaseSet_Tangela extends CardWorker_Pokemon {
    public override readonly name: string = "Tangela";
    public override readonly type: EnergyType = EnergyType.Grass;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Tangela");
    public override readonly hp: number = 50;
    public override readonly weakness: EnergyType | null = EnergyType.Fire;
    public override readonly retreatCost: number = 2;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Tangela.Bind", "Bind")
            .costs(EnergyType.Grass, EnergyType.Colorless)
            .deals(20)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Paralyzed.")
            .paralyzes()
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Tangela.Poisonpowder", "Poisonpowder")
            .costs(EnergyType.Grass, EnergyType.Grass, EnergyType.Grass)
            .deals(20)
            .reads("The Defending Pokémon is now Poisoned.")
            .poisons("always")
            .finalize()
    ];
};
