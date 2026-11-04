import { EnergyType } from "../../../EnergyType.js";
import { AttackWorker } from "../AttackWorker.js";
import { Card } from "../../CardDatabase.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";

@Card("BaseSet.Voltorb")
export class Card_Pokemon_BaseSet_Voltorb extends CardWorker_Pokemon {
    public override readonly name = "Voltorb";
    public override readonly type = EnergyType.Lightning;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Voltorb");
    public override readonly hp = 40;
    public override readonly weakness = EnergyType.Fighting;
    public override readonly resistance = null;
    public override readonly retreatCost = 1;

    public override readonly attacks: AttackWorker[] = [
        AttackFactory.makeAttack("BaseSet.Voltorb.Tackle", "Tackle")
            .costs(EnergyType.Colorless)
            .deals(10)
            .finalize()
    ];
}
