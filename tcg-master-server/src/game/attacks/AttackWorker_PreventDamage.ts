import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_PreventDamage extends AttackWorker {
    public override postEffect(context: AttackContext) {
        if (this.args.trigger === "always" || context.engine.game.flipCoin(context.attacker.owner)) {
            context.attacker.giveStatus(DefDatabase.get<StatusDef>("DamagePrevention"), { amount: this.args.amount, buffer: this.args.buffer })
        }
    }
};
