import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Koffing")
export class Card_Pokemon_BaseSet_Koffing extends CardWorker_Pokemon {
    public override readonly name: string = "Koffing";
    public override readonly type: EnergyType = EnergyType.Grass;
    public override readonly stage = "basic";
    public override readonly evolutionTree = new EvolutionTree("Koffing");
    public override readonly hp: number = 50;
    public override readonly weakness = EnergyType.Psychic;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Koffing.FoulGas", "Foul Gas")
            .costs(EnergyType.Grass, EnergyType.Grass)
            .deals(10)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Poisoned; if tails, it is now Confused.")
            .withPostEffect((context: AttackContext, knockedOut: boolean) => {
                if (!knockedOut) {
                    if (context.game.flipCoin(context.game.players.active.id)) {
                        context.game.pokemon.poison(context.game.players.inactive.id, context.defender.id);
                    } else {
                        context.game.pokemon.confuse(context.game.players.inactive.id, context.defender.id);
                    }
                }
            })
            .finalize()
    ];
};
