import { DefDatabase } from "../../../defs/DefDatabase.js";
import { StatusDef } from "../../../defs/StatusDef.js";
import { Choice } from "../../state/Choice.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../../state/interrupts/InterruptResolution.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Metronome extends AttackComp {
    public override validateTargets(context: AttackContext): Interrupt | null {
        context.attacker.giveStatus(DefDatabase.get<StatusDef>("MetronomeUsage"), { cost: context.attack.cost.map(c => c.name) });
        return {
            player: context.attacker.owner.id,
            prompt: `Select one of ${context.defender.name}'s attacks for ${context.attacker.name} to use.`,
            choices: context.defender.def.attacks.map(a => new Choice(a)),
            resolution: InterruptResolution.Attack
        };
    }

    public override apply(context: AttackContext): void { }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
