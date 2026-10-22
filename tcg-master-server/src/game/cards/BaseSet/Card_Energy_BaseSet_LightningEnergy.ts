import { EnergyType } from "../../EnergyType.js";
import { Card_Energy } from "../Card_Energy.js";

export class Card_Energy_BaseSet_LightningEnergy extends Card_Energy {
    public override readonly name: string = "Lightning Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Lightning;
}