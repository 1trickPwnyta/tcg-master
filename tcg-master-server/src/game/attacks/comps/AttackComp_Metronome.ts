import { DefDatabase } from "../../../defs/DefDatabase.js";
import { StatusDef } from "../../../defs/StatusDef.js";
import { Choice } from "../../state/interrupts/Choice.js";
import { Interrupt, InterruptSync } from "../../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../../state/interrupts/InterruptResolution.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Metronome extends AttackComp {
    public override validateTargets(context: AttackContext): Interrupt | null {
        context.attacker.giveStatus(DefDatabase.get<StatusDef>("MetronomeUsage"), { cost: context.attack.cost.map(c => c.name) });
        return new InterruptSync(context.attacker.owner)
            .withPrompt("Select one of", context.defender, "'s attacks for", context.attacker, "to use.")
            .withChoices(context.defender.def.attacks.map(a => new Choice(a)))
            .withResolution(InterruptResolution.Attack);
    }

    public override apply(context: AttackContext): void { }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
