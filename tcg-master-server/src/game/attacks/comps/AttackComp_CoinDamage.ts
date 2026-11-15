import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_CoinDamage extends AttackComp {
    public override apply(context: AttackContext) {
        for (let i = 0; i < this.args.coins; i++) {
            if (context.engine.game.flipCoin(context.attacker.owner)) {
                context.damage_defender += this.args.amount;
            } else {
                context.damage_attacker += this.args.selfDamage ?? 0;
            }
        }
    }
};
