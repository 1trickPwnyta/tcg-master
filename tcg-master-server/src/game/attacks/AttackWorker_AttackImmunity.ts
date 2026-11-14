import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_AttackImmunity extends AttackWorker {
    public override postEffect(context: AttackContext) {
        if (this.args.trigger === "always" || context.engine.game.flipCoin(context.attacker.owner)) {
            context.attacker.giveStatus(DefDatabase.get<StatusDef>("AttackImmunity"));
        }
    }
};
