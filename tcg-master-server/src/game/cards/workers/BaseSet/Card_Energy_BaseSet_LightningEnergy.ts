import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { CardWorker_Energy } from "../../CardWorker_Energy.js";

@Card("BaseSet.LightningEnergy")
export class Card_Energy_BaseSet_LightningEnergy extends CardWorker_Energy {
    public override readonly name: string = "Lightning Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Lightning;
}