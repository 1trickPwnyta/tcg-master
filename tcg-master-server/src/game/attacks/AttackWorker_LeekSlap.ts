import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_LeekSlap extends AttackWorker {
    public override preEffect(context: AttackContext, damage: number): number {
        context.attacker.giveStatus(DefDatabase.get<StatusDef>("LeekSlap"));
        return damage;
    }
};
