import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Metapod")
export class Card_Pokemon_BaseSet_Metapod extends CardWorker_Pokemon {
    public override readonly name: string = "Metapod";
    public override readonly type: EnergyType = EnergyType.Grass;
    public override readonly stage = "stage1";
    public override readonly evolutionTree = EvolutionTree.Caterpie;
    public override readonly hp: number = 70;
    public override readonly weakness = EnergyType.Fire;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 2;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Metapod.Stiffen", "Stiffen")
            .costs(EnergyType.Colorless, EnergyType.Colorless)
            .reads("Flip a coin. If heads, prevent all damage done to Metapod during your opponent's next turn. <em>(Any other effects of attacks still happen.)</em>")
            .prevents("damage")
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Metapod.StunSpore", "Stun Spore")
            .costs(EnergyType.Grass, EnergyType.Grass)
            .deals(20)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Paralyzed.")
            .paralyzes()
            .finalize()
    ];
};
