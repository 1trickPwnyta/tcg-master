import { StatusDef } from "../StatusDef.js";
import { DefOf } from "./DefOf.js";

@DefOf<StatusDef>()
export class StatusDefOf {
    public static readonly Paralysis: StatusDef;
    public static readonly Sleep: StatusDef;
    public static readonly Confusion: StatusDef;
    public static readonly Poison: StatusDef;
};
