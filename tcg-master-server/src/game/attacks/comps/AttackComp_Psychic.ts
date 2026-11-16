import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Psychic extends AttackComp {
    public override apply(context: AttackContext): void {
        context.damage_defender += context.defender.attachments.energyCards.length * 10;
    }
};
