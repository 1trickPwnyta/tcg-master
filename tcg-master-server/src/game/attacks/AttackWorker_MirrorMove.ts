import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_MirrorMove extends AttackWorker {
    public override preEffect(context: AttackContext, damage: number): number {
        const result = context.engine.game.attackResult;
        if (result?.defender_id === context.attacker.id) {
            return result.damage;
        }

        return damage;
    }

    public override postEffect(context: AttackContext, knockedOut: boolean) {
        if (!knockedOut) {
            const result = context.engine.game.attackResult;
            if (result?.defender_id === context.attacker.id) {
                for (const status of result.status) {
                    const def = DefDatabase.get<StatusDef>(status.def);
                    context.defender.giveStatus(def, status.args);
                }
            }
        }
    }
};
