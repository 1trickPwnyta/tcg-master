import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Heal extends AttackComp {
    public override apply(context: AttackContext) {
        const amount = this.args.amount === "all" ? context.attacker.damage : this.args.amount;
        context.damage_attacker -= amount;
    }
};
