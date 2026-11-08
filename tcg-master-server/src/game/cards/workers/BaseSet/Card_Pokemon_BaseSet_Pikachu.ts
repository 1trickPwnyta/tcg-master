import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Pikachu")
export class Card_Pokemon_BaseSet_Pikachu extends CardWorker_Pokemon {
    public override readonly name: string = "Pikachu";
    public override readonly type: EnergyType = EnergyType.Lightning;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Pikachu");
    public override readonly hp: number = 40;
    public override readonly weakness: EnergyType | null = EnergyType.Fighting;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Pikachu.Gnaw", "Gnaw")
            .costs(EnergyType.Colorless)
            .deals(10)
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Pikachu.ThunderJolt", "Thunder Jolt")
            .costs(EnergyType.Lightning, EnergyType.Colorless)
            .deals(30)
            .reads("Flip a coin. If tails, Pikachu does 10 damage to itself.")
            .withPostEffect((context: AttackContext, _knockedOut: boolean) => {
                if (!context.engine.flipCoin(context.engine.players.active.id)) {
                    context.engine.pokemon.damage({ owner_id: context.engine.players.active.id, card_id: context.attacker.id, amount: 10 });
                }
            })
            .finalize()
    ];
};
