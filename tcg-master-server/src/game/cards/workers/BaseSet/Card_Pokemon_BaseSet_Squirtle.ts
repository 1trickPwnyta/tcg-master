import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Squirtle")
export class Card_Pokemon_BaseSet_Squirtle extends CardWorker_Pokemon {
    public override readonly name: string = "Squirtle";
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Squirtle");
    public override readonly hp: number = 40;
    public override readonly weakness: EnergyType | null = EnergyType.Lightning;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Squirtle.Bubble", "Bubble")
            .costs(EnergyType.Water)
            .deals(10)
            .reads("Flip a coin. If heads, the Defending Pokémon is now Paralyzed.")
            .paralyzes()
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Squirtle.Withdraw", "Withdraw")
            .costs(EnergyType.Water, EnergyType.Colorless)
            .reads("Flip a coin. If heads, prevent all damage done to Squirtle during your opponent's next turn. <em>(Any other effects of attacks still happen.)</em>")
            .withPostEffect((context: AttackContext, _knockedOut: boolean) => {
                if (context.game.flipCoin(context.game.players.active.id)) {
                    context.attacker.damagePrevention = -1;
                }
            })
            .finalize()
    ];
};
