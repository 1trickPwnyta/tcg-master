import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_SelfDamage extends AttackComp {
    public override apply(context: AttackContext) {
        if (this.args.trigger === "always" || !context.engine.game.flipCoin(context.attacker.owner)) {
            context.damage_attacker += this.args.amount;
        }
    }

    public override applyAverage(context: AttackContext): void {
        if (this.args.trigger === "always") {
            this.apply(context);
        } else {
            context.damage_attacker += this.args.amount / 2;
        }
    }
};
