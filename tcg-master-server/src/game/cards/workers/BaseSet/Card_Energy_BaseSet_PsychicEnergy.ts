import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { CardWorker_Energy } from "../CardWorker_Energy.js";

@Card("BaseSet.PsychicEnergy")
export class Card_Energy_BaseSet_PsychicEnergy extends CardWorker_Energy {
    public override readonly name: string = "Psychic Energy";
    public override readonly basic: boolean = true;
    public override readonly type: EnergyType = EnergyType.Psychic;
    public override readonly text = null;
}