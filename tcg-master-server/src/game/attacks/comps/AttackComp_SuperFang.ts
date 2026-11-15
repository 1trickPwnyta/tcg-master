import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_SuperFang extends AttackComp {
    public override apply(context: AttackContext): void {
        const remaining = context.defender.def.hp - context.defender.damage;
        context.damage_defender = Math.ceil(remaining / 20) * 10;
    }
};
