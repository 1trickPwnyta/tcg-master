import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackContext, AttackWorker } from "../AttackWorker.js";
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
        new class extends AttackWorker {
            dbid = "BaseSet.Tangela.Bind";
            name = "Bind";
            cost = [ EnergyType.Grass, EnergyType.Colorless ];
            damage = 20;
            text = "Flip a coin. If heads, the Defending Pokémon is now Paralyzed.";

            protected override postEffect(context: AttackContext, knockedOut: boolean): void {
                if (!knockedOut && context.game.flipCoin(context.game.activePlayer.id)) {
                    context.game.paralyzePokemon(context.game.inactivePlayer.id, context.defender.id);
                }
            }
        }(),
        new class extends AttackWorker {
            dbid = "BaseSet.Tangela.Poisonpowder";
            name = "Poisonpowder";
            cost = [ EnergyType.Grass, EnergyType.Grass, EnergyType.Grass ];
            damage = 20;
            text = "The Defending Pokémon is now Poisoned.";

            protected override postEffect(context: AttackContext, knockedOut: boolean): void {
                if (!knockedOut) {
                    context.game.poisonPokemon(context.game.inactivePlayer.id, context.defender.id);
                }
            }
        }()
    ];
};
