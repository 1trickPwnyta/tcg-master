import { AttackContext } from "../AttackContext.js";
import { EnergyCost } from "../EnergyCost.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_WaterGun extends AttackComp {
    public override apply(context: AttackContext): void {
        const extraEnergy = EnergyCost.costOversatisfied(context.attack.cost, context.attacker.energy).filter(e => e.name === this.args.cost);
        context.damage_defender += this.args.amount * Math.min(this.args.limit, extraEnergy.length);
    }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
