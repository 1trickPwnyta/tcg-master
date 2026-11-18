import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Missable extends AttackComp {
    public override apply(context: AttackContext): void {
        if (!context.engine.game.flipCoin(context.attacker.owner)) {
            context.fail();
        }
    }

    public override applyAverage(context: AttackContext): void {
        // TODO Let's have the AI avoid moves like this by always failing, but give a few bonus points for trying, in case there's nothing better to do
        context.fail();
    }
};
