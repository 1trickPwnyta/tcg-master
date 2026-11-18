import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_MirrorMove extends AttackComp {
    public override apply(context: AttackContext): void {
        const attack = context.engine.game.attackResult;
        if (attack?.defender === context.attacker.id) {
            context.damage_defender = attack.damage;
            for (const status of attack.status) {
                context.addDefenderStatus(status.def, status.args);
            }
        }
    }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
