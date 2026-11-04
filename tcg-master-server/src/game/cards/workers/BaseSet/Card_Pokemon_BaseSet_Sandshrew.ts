import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Sandshrew")
export class Card_Pokemon_BaseSet_Sandshrew extends CardWorker_Pokemon {
    public override readonly name: string = "Sandshrew";
    public override readonly type: EnergyType = EnergyType.Fighting;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Sandshrew");
    public override readonly hp: number = 40;
    public override readonly weakness = EnergyType.Grass;
    public override readonly resistance = EnergyType.Lightning;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Sandshrew.SandAttack", "Sand-attack")
            .costs(EnergyType.Fighting)
            .reads("If the Defending Pokémon tries to attack during your opponent's next turn, your opponent flips a coin. If tails, this attack does nothing.")
            .deals(10)
            .withPostEffect((context: AttackContext, _knockedOut: boolean) => {
                context.defender.accuracyChecks = (context.defender.accuracyChecks ?? 0) + 1;
            })
            .finalize()
    ];
};
