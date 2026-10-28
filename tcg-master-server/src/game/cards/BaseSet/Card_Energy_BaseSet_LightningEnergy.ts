import { EnergyType } from "../../EnergyType.js";
import { CardWorker_Energy } from "../CardWorker_Energy.js";

export class Card_Energy_BaseSet_LightningEnergy extends CardWorker_Energy {
    public override readonly dbid = "BaseSet.LightningEnergy";
    public override readonly name: string = "Lightning Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Lightning;
}