import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackContext, AttackWorker } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Pikachu")
export class Card_Pokemon_BaseSet_Pikachu extends CardWorker_Pokemon {
    public override readonly name: string = "Pikachu";
    public override readonly type: EnergyType = EnergyType.Lightning;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Pikachu");
    public override readonly hp: number = 40;
    public override readonly weakness: EnergyType | null = EnergyType.Fighting;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        new class extends AttackWorker {
            dbid = "BaseSet.Pikachu.Gnaw";
            name = "Gnaw";
            cost = [ EnergyType.Colorless ];
            damage = 10;
            text = null;
        }(),
        new class extends AttackWorker {
            dbid = "BaseSet.Pikachu.ThunderJolt";
            name = "Thunder Jolt";
            cost = [ EnergyType.Lightning, EnergyType.Colorless ];
            damage = 30;
            text = "Flip a coin. If tails, Pikachu does 10 damage to itself.";

            protected override postEffect(context: AttackContext, _knockedOut: boolean): void {
                if (!context.game.flipCoin(context.game.activePlayer.id)) {
                    context.game.damagePokemon(context.game.activePlayer.id, context.attacker.id, 10);
                }
            }
        }()
    ];
};
