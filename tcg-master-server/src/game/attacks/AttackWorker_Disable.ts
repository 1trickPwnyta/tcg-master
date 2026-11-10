import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Disable extends AttackWorker {
    public override validateTargets(context: AttackContext, attack_name: string): Interrupt | null {
        if (!attack_name) {
            return {
                player: context.attacker.owner.id,
                prompt: "Select an attack to disable.",
                choices: context.defender.def.attacks.map(a => new Choice(a)),
                resolution: InterruptResolution.AttackTargets,
                args: [ context.attack.name ]
            };
        }

        return null;
    }

    public override postEffect(context: AttackContext, _knockedOut: boolean, attack_name: string): void {
        context.defender.giveStatus(DefDatabase.get<StatusDef>("Disablement"), { attack_name: attack_name });
    }
};
