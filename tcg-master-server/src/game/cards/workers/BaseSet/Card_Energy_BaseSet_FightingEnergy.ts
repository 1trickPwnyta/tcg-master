import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { CardWorker_Energy } from "../CardWorker_Energy.js";

@Card("BaseSet.FightingEnergy")
export class Card_Energy_BaseSet_FightingEnergy extends CardWorker_Energy {
    public override readonly name: string = "Fighting Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Fighting;
    public override readonly text = null;
}