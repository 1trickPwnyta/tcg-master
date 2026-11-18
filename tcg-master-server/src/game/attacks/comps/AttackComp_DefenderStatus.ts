import { DefDatabase } from "../../../defs/DefDatabase.js";
import { StatusDef } from "../../../defs/StatusDef.js";
import { AttackContext } from "../AttackContext.js";
import { AttackComp } from "./AttackComp.js";

export class AttackComp_DefenderStatus extends AttackComp {
    protected get status(): StatusDef {
        return DefDatabase.get<StatusDef>(this.args.status);
    }

    public override apply(context: AttackContext) {
        if (this.args.trigger === "always" || context.engine.game.flipCoin(context.attacker.owner)) {
            context.addDefenderStatus(this.status, this.args.args);
        }
    }

    public override applyAverage(context: AttackContext): void {
        // TODO Use half status
        context.addDefenderStatus(this.status, this.args.args);
    }
};
