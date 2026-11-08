import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Starmie")
export class Card_Pokemon_BaseSet_Starmie extends CardWorker_Pokemon {
    public override readonly name: string = "Starmie";
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly stage = "stage1";
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Staryu;
    public override readonly hp: number = 60;
    public override readonly weakness: EnergyType | null = EnergyType.Lightning;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Starmie.Recover", "Recover")
            .costs(EnergyType.Water, EnergyType.Water)
            .reads(`Discard 1 ${EnergyType.Water} Energy card attached to Starmie in order to use this attack. Remove all damage counters from Starmie.`)
            .discards(1, EnergyType.Water)
            .withPostEffect((context: AttackContext, _knockedOut: boolean) => {
                context.engine.pokemon.heal(context.engine.players.active.id, context.attacker.id, context.attacker.damage);
            })
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Starmie.StarFreeze", "Star Freeze")
            .costs(EnergyType.Water, EnergyType.Colorless, EnergyType.Colorless)
            .deals(20)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Paralyzed.")
            .paralyzes()
            .finalize()
    ];
};
