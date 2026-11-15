import { StatusDefOf } from "../../../defs/defof/StatusDefOf.js";
import { StatusDef } from "../../../defs/StatusDef.js";
import { AttackComp_DefenderStatus } from "./AttackComp_DefenderStatus.js";

export class AttackComp_Paralyze extends AttackComp_DefenderStatus {
    protected override get status(): StatusDef {
            return StatusDefOf.Paralysis;
        }
};
