import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_DestinyBond extends AttackWorker {
    public override postEffect(context: AttackContext) {
        context.engine.pokemon.giveStatus(context.engine.players.active.id, context.attacker.id, DefDatabase.get<StatusDef>("DestinyBond"));
    }
};
