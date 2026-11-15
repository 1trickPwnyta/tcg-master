import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Flail extends AttackComp {
    public override apply(context: AttackContext): void {
        context.damage_defender += context.attacker.damage;
    }
};
