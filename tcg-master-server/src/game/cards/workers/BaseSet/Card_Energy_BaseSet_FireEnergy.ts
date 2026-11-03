import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { CardWorker_Energy } from "../CardWorker_Energy.js";

@Card("BaseSet.FireEnergy")
export class Card_Energy_BaseSet_FireEnergy extends CardWorker_Energy {
    public override readonly name: string = "Fire Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Fire;
    public override readonly text = null;
}