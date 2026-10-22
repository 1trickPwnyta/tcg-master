import { EnergyType } from "../../EnergyType.js";
import { Card_Energy } from "../Card_Energy.js";

export class Card_Energy_BaseSet_FireEnergy extends Card_Energy {
    public override readonly name: string = "Fire Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Fire;
}