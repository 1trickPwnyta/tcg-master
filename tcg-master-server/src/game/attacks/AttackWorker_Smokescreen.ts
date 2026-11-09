import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_Smokescreen extends AttackWorker {
    public override postEffect(context: AttackContext, knockedOut: boolean) {
        if (!knockedOut) {
            context.defender.giveStatus(DefDatabase.get<StatusDef>("Smokescreen"));
        }
    }
};
