import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_CoinDamage extends AttackComp {
    public override apply(context: AttackContext) {
        const results = context.engine.game.flipCoin(context.attacker.owner, this.args.coins);
        context.damage_defender += this.args.amount * results;
        context.damage_attacker += (this.args.selfDamage ?? 0) * (this.args.coins - results);
    }

    public override applyAverage(context: AttackContext): void {
        context.damage_defender += this.args.amount * this.args.coins / 2;
        context.damage_attacker += (this.args.selfDamage ?? 0) * this.args.coins / 2;
    }
};
