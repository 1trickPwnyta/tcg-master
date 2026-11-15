import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Missable extends AttackComp {
    public override apply(context: AttackContext): void {
        if (!context.engine.game.flipCoin(context.attacker.owner)) {
            context.fail();
        }
    }
};
