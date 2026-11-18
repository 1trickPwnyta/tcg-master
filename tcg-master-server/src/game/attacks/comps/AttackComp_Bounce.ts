import { DefDatabase } from "../../../defs/DefDatabase.js";
import { EffectDef } from "../../../defs/EffectDef.js";
import { Choice } from "../../state/Choice.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Bounce extends AttackComp {
    public override validateTargets(context: AttackContext): Interrupt | null {
        if (this.args.choice === "attacker" && context.defender.owner.bench.count) {
            const target = context.nextTarget();
            if (!target) {
                return this.generateInterrupt(context,
                    `Select a Pokémon from ${context.defender.owner.name}'s bench to switch in.`,
                    context.defender.owner.bench.cards.map(c => new Choice(c))
                );
            }
        }

        return null;
    }

    public override apply(context: AttackContext) {
        if (this.args.choice === "attacker" && context.defender.owner.bench.count) {
            const target = context.nextTarget();
            context.addEffect(DefDatabase.get<EffectDef>("Bounce"), { "target": target });
        } else {
            context.addEffect(DefDatabase.get<EffectDef>("Bounce"));
        }
    }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
