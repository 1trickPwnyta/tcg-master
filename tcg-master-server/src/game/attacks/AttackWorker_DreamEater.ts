import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { AttackContext, AttackWorker } from "./AttackWorker.js";

export class AttackWorker_DreamEater extends AttackWorker {
    public override canUse(context: AttackContext): boolean {
        return context.defender.hasStatus(StatusDefOf.Sleep);
    }
};
