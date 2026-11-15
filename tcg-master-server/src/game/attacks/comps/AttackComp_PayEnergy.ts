import { DefDatabase } from "../../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../../defs/EnergyTypeDef.js";
import { Choice } from "../../state/Choice.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_PayEnergy extends AttackComp {
    public override validateTargets(context: AttackContext): Interrupt | null {
        if (this.args.cost !== "all") {
            const cost = [ ...this.args.cost.map((c: string) => DefDatabase.get<EnergyTypeDef>(c))
                .sort((a: EnergyTypeDef, b: EnergyTypeDef) => b.resolutionPriority - a.resolutionPriority) ];
            for (const def of cost) {
                const energy = context.nextTarget();
                if (!energy) {
                    return this.generateInterrupt(context,
                        `Select a ${def.symbol} energy card to discard from ${context.attacker.name}.`,
                        context.attacker.attachments.energyCards.filter(c => c.type == def).map(c => new Choice(c.card))
                    )
                }
            }
        }

        return null;
    }

    public override apply(context: AttackContext) {
        if (this.args.cost === "all") {
            for (const card of context.attacker.attachments.energyCards) {
                card.card.discard();
            }
        } else {
            for (let i = 0; i < this.args.cost.length; i++) {
                const energy = context.nextTargetCard();
                energy?.discard();
            }
        }
    }
};
