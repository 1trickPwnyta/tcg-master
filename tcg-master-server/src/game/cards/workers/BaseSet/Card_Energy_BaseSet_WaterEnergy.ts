import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { CardWorker_Energy } from "../CardWorker_Energy.js";

@Card("BaseSet.WaterEnergy")
export class Card_Energy_BaseSet_WaterEnergy extends CardWorker_Energy {
    public override readonly name: string = "Water Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly text = null;
}