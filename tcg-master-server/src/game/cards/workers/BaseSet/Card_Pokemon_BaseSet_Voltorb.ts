import { EnergyType } from "../../../EnergyType.js";
import { AttackWorker } from "../../AttackWorker.js";
import { Card } from "../../CardDatabase.js";
import { CardWorker_Pokemon } from "../../CardWorker_Pokemon.js";

@Card("BaseSet.Voltorb")
export class Card_Pokemon_BaseSet_Voltorb extends CardWorker_Pokemon {
    public override readonly name = "Voltorb";
    public override readonly evo = "basic";
    public override readonly hp = 40;
    public override readonly retreatCost = 1;

    public override readonly attacks: AttackWorker[] = [
        new class extends AttackWorker {
            name = "Tackle";
            cost = [ EnergyType.Colorless ];
            damage = 10;
        }(this, "Tackle")
    ];
}
