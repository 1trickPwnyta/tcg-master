import { EnergyType } from "../../../EnergyType.js";
import { CardStatus } from "../../../state/CardState.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Gastly")
export class Card_Pokemon_BaseSet_Gastly extends CardWorker_Pokemon {
    public override readonly name: string = "Gastly";
    public override readonly type: EnergyType = EnergyType.Psychic;
    public override readonly stage = "basic";
    public override readonly evolutionTree = new EvolutionTree("Gastly");
    public override readonly hp: number = 30;
    public override readonly weakness = null;
    public override readonly resistance = EnergyType.Fighting;
    public override readonly retreatCost: number = 0;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Gastly.SleepingGas", "Sleeping Gas")
            .costs(EnergyType.Psychic)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Asleep.")
            .sleeps()
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Gastly.DestinyBond", "Destiny Bond")
            .costs(EnergyType.Psychic, EnergyType.Colorless)
            .reads(`Discard 1 ${EnergyType.Psychic.symbol} Energy card attached to Gastly in order to use this attack. If a Pokémon Knocks Out Gastly during your opponent's next turn, Knock Out that Pokémon.`)
            .discards(1, EnergyType.Psychic)
            .withPostEffect((context: AttackContext) => {
                context.game.pokemon.giveStatus(context.attacker.id, CardStatus.GastlyDestinyBond);
            })
            .finalize()
    ];
};
