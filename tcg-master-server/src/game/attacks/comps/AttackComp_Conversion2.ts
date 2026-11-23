import { DefDatabase } from "../../../defs/DefDatabase.js";
import { EnergyTypeDefOf } from "../../../defs/defof/EnergyTypeDefOf.js";
import { EnergyTypeDef } from "../../../defs/EnergyTypeDef.js";
import { StatusDef } from "../../../defs/StatusDef.js";
import { Choice } from "../../state/interrupts/Choice.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Conversion2 extends AttackComp {
    public override validateTargets(context: AttackContext): Interrupt | null {
        const type = context.nextTarget();
        if (!type) {
            return this.generateInterrupt(context,
                DefDatabase.getAll<EnergyTypeDef>("EnergyTypeDef").filter(e => e != EnergyTypeDefOf.Colorless).map(e => new Choice(e)))
                .withPrompt("Select a type to change", context.attacker, "'s resistance to.");
        }

        return null;
    }

    public override apply(context: AttackContext): void {
        const type = context.nextTarget() as string;
        context.addAttackerStatus(DefDatabase.get<StatusDef>("ModifiedResistance"), { type: type });
    }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
