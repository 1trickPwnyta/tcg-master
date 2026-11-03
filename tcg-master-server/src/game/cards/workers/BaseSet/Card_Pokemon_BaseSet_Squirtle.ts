import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackContext, AttackWorker } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Squirtle")
export class Card_Pokemon_BaseSet_Squirtle extends CardWorker_Pokemon {
    public override readonly name: string = "Squirtle";
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Squirtle");
    public override readonly hp: number = 40;
    public override readonly weakness: EnergyType | null = EnergyType.Lightning;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        new class extends AttackWorker {
            dbid = "BaseSet.Squirtle.Bubble";
            name = "Bubble";
            cost = [ EnergyType.Water ];
            damage = 10;
            text = "Flip a coin. If heads, the Defending Pokémon is now Paralyzed.";

            protected override postEffect(context: AttackContext, knockedOut: boolean): void {
                if (!knockedOut && context.game.flipCoin(context.game.activePlayer.id)) {
                    context.game.paralyzePokemon(context.game.inactivePlayer.id, context.defender.id);
                }
            }
        }(),
        new class extends AttackWorker {
            dbid = "BaseSet.Squirtle.Withdraw";
            name = "Withdraw";
            cost = [ EnergyType.Water, EnergyType.Colorless ];
            damage = 0;
            text = "Flip a coin. If heads, prevent all damage done to Squirtle during your opponent's next turn. <em>(Any other effects of attacks still happen.)</em>";

            protected override postEffect(context: AttackContext, _knockedOut: boolean): void {
                if (context.game.flipCoin(context.game.activePlayer.id)) {
                    context.attacker.damagePrevention = -1;
                }
            }
        }()
    ];
};
