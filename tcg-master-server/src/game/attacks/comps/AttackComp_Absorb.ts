import { DefDatabase } from "../../../defs/DefDatabase.js";
import { EffectDef } from "../../../defs/EffectDef.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_Absorb extends AttackComp {
    public override apply(context: AttackContext) {
        context.addEffect(DefDatabase.get<EffectDef>("Absorb"), this.args);
    }

    public override applyAverage(context: AttackContext): void {
        this.apply(context);
    }
};
