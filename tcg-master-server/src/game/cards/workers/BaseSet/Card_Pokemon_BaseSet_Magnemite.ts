import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Magnemite")
export class Card_Pokemon_BaseSet_Magnemite extends CardWorker_Pokemon {
    public override readonly name: string = "Magnemite";
    public override readonly type: EnergyType = EnergyType.Lightning;
    public override readonly stage = "basic";
    public override readonly evolutionTree = new EvolutionTree("Magnemite");
    public override readonly hp: number = 40;
    public override readonly weakness = EnergyType.Fighting;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Magnemite.ThunderWave", "Thunder Wave")
            .costs(EnergyType.Lightning)
            .deals(10)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Paralyzed.")
            .paralyzes()
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Magnemite.Selfdestruct", "Selfdestruct")
            .costs(EnergyType.Lightning, EnergyType.Colorless)
            .deals(40)
            .reads("Does 10 damage to each Pokémon on each player's Bench. <em>(Don't apply Weakness and Resistance for Benched Pokémon.)</em> Magnemite does 40 damage to itself.")
            .withPostEffect((context: AttackContext) => {
                for (const player of context.state.players) {
                    for (const card of player.bench.cards) {
                        context.game.pokemon.damage({ amount: 10, card_id: card.id, owner_id: player.id });
                    }
                }
                context.game.pokemon.damage({ amount: 40, card_id: context.attacker.id, owner_id: context.game.players.active.id });
            })
            .finalize()
    ];
};
