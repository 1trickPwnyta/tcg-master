import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyTypeDefOf } from "../../defs/defof/EnergyTypeDefOf.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Conversion1 extends AttackWorker {
    public override validateTargets(context: AttackContext, target_type: string): Interrupt | null {
        if (context.defender.def.weakness && !target_type) {
            return {
                player: context.attacker.owner.id,
                prompt: `Select a type to change ${context.defender.name}'s weakness to.`,
                choices: DefDatabase.getAll<EnergyTypeDef>("EnergyTypeDef").filter(e => e != EnergyTypeDefOf.Colorless).map(e => new Choice(e)),
                resolution: InterruptResolution.AttackTargets,
                args: [ context.attack.name ]
            };
        }

        return null;
    }

    public override postEffect(context: AttackContext, _knockedOut: boolean, target_type: string): void {
        if (target_type) {
            context.defender.giveStatus(DefDatabase.get<StatusDef>("ModifiedWeakness"), { type: DefDatabase.get<EnergyTypeDef>(target_type) });
        }
    }
};
