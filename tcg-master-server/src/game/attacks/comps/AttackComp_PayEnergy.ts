import { DefDatabase } from "../../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../../defs/EnergyTypeDef.js";
import { Choice } from "../../state/Choice.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_PayEnergy extends AttackComp {
    public override validateTargets(context: AttackContext): Interrupt | null {
        for (const def of [ ...this.args.cost.map((c: string) => DefDatabase.get<EnergyTypeDef>(c))
                .sort((a: EnergyTypeDef, b: EnergyTypeDef) => b.resolutionPriority - a.resolutionPriority) ]) {
            const energy = context.nextTarget();
            if (!energy) {
                return this.generateInterrupt(context,
                    `Select a ${def.symbol} energy card to discard from ${context.attacker.name}.`,
                    context.attacker.attachments.energyCards.filter(c => c.type == def).map(c => new Choice(c.card))
                )
            }
        }

        return null;
    }

    public override apply(context: AttackContext): void {
        for (let i = 0; i < this.args.cost.length; i++) {
            const energy = context.nextTargetCard();
            energy.discard();
        }
    }
};
