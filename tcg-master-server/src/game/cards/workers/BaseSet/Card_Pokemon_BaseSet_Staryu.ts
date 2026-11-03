import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackWorker } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Staryu")
export class Card_Pokemon_BaseSet_Staryu extends CardWorker_Pokemon {
    public override readonly name: string = "Staryu";
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Staryu;
    public override readonly hp: number = 40;
    public override readonly weakness = EnergyType.Lightning;
    public override readonly retreatCost: number = 1;

    public override readonly attacks: AttackWorker[] = [
        new class extends AttackWorker {
            dbid = "BaseSet.Staryu.Slap";
            name = "Slap";
            cost = [ EnergyType.Water ];
            damage = 20;
            text = null;
        }()
    ];
};
