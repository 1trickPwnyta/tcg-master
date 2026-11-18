import { DefDatabase } from "../../../defs/DefDatabase.js";
import { StatusDef } from "../../../defs/StatusDef.js";
import { Choice } from "../../state/Choice.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Disable extends AttackComp {
    public override validateTargets(context: AttackContext): Interrupt | null {
        const attack_name = context.nextTarget();
        if (!attack_name) {
            return this.generateInterrupt(context,
                `Select one of ${context.defender.name}'s attacks to disable.`,
                context.defender.def.attacks.map(a => new Choice(a))
            );
        }

        return null;
    }

    public override apply(context: AttackContext): void {
        const attack_name = context.nextTarget() as string;
        context.addDefenderStatus(DefDatabase.get<StatusDef>("Disablement"), { "attack_name": attack_name });
    }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
