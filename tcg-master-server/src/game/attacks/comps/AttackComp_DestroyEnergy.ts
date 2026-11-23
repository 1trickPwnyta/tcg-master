import { DefDatabase } from "../../../defs/DefDatabase.js";
import { EffectDef } from "../../../defs/EffectDef.js";
import { Choice } from "../../state/interrupts/Choice.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_DestroyEnergy extends AttackComp {
    public override validateTargets(context: AttackContext): Interrupt | null {
        const energy = context.nextTarget();
        if (!energy) {
            if (context.defender.attachments.energyCards.length) {
                return this.generateInterrupt(context,
                    context.defender.attachments.energyCards.map(c => new Choice(c.card)))
                    .withPrompt("Choose an energy card to discard from", context.defender, ".");
            } else {
                context.addTarget(null);
            }
        }

        return null;
    }

    public override apply(context: AttackContext): void {
        const energy = context.nextTargetCard();
        if (energy) {
            context.addEffect(DefDatabase.get<EffectDef>("DestroyEnergy"), { energy: energy.id });
        }
    }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
