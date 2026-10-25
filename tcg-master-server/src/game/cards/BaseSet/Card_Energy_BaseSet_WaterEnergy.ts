import { EnergyType } from "../../EnergyType.js";
import { Card_Energy } from "../Card_Energy.js";

export class Card_Energy_BaseSet_WaterEnergy extends Card_Energy {
    public override readonly name: string = "Water Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Water;
}