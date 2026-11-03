import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackContext, AttackWorker } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Vulpix")
export class Card_Pokemon_BaseSet_Vulpix extends CardWorker_Pokemon {
    public override readonly name: string = "Vulpix";
    public override readonly type: EnergyType = EnergyType.Fire;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Vulpix;
    public override readonly hp: number = 50;
    public override readonly weakness: EnergyType | null = EnergyType.Water;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        new class extends AttackWorker {
            dbid = "BaseSet.Vulpix.ConfuseRay";
            name = "Confuse Ray";
            cost = [ EnergyType.Fire, EnergyType.Fire ];
            damage = 10;
            text = "Flip a coin. If heads, the Defending Pokémon is now Confused.";

            protected override postEffect(context: AttackContext, knockedOut: boolean): void {
                if (!knockedOut && context.game.flipCoin(context.game.activePlayer.id)) {
                    context.game.confusePokemon(context.game.inactivePlayer.id, context.defender.id);
                }
            }
        }()
    ];
};
