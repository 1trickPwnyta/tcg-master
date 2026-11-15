import { DefDatabase } from "../../../defs/DefDatabase.js";
import { StatusDef } from "../../../defs/StatusDef.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_AttackerStatus extends AttackComp {
    public override apply(context: AttackContext) {
        if (this.args.trigger === "always" || context.engine.game.flipCoin(context.attacker.owner) === (this.args.trigger === "heads" ? true : false)) {
            context.addAttackerStatus(DefDatabase.get<StatusDef>(this.args.status));
        }
    }
};
