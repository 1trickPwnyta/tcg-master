import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { CardWorker_Energy } from "../CardWorker_Energy.js";

@Card("BaseSet.GrassEnergy")
export class Card_Energy_BaseSet_GrassEnergy extends CardWorker_Energy {
    public override readonly name: string = "Grass Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Grass;
    public override readonly text = null;
}