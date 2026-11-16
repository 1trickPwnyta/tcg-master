import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { Attack } from "../attacks/Attack.js";
import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_MetronomeUsage extends StatusModifier {
    public override modifyAttackCost(context: ModifierContext, attack: Attack, args: any): EnergyTypeDef[] {
        if (!context.card.def.attacks.includes(attack)) {
            return args.cost.map((c: string) => DefDatabase.get<EnergyTypeDef>(c));
        } else {
            return attack.cost;
        }
    }
};
