import { DefDatabase } from "../../../defs/DefDatabase.js";
import { EffectDef } from "../../../defs/EffectDef.js";
import { StatusDef } from "../../../defs/StatusDef.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_SplitCoin extends AttackComp {
    public override apply(context: AttackContext): void {
        const path = context.engine.game.flipCoin(context.attacker.owner) ? this.args.heads : this.args.tails;
        if (path.effect === "status") {
            const status = DefDatabase.get<StatusDef>(path.args.status);
            context.addDefenderStatus(status, path.args);
        } else {
            const effect = DefDatabase.get<EffectDef>(path.effect);
            context.addEffect(effect, path.args);
        }
    }

    public override applyAverage(context: AttackContext): void {
        // TODO This should actually use "half status" which applies the status in the simulation but doesn't give it points on its own
        // And effects need to have an average function too
        if (this.args.heads.effect === "status") {
            const status = DefDatabase.get<StatusDef>(this.args.heads.args.status);
            context.addDefenderStatus(status, this.args.heads.args);
        } else {
            const effect = DefDatabase.get<EffectDef>(this.args.heads.effect);
            context.addEffect(effect, this.args.heads.args);
        }
    }
};
