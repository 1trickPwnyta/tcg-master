import { StatusDef } from "../../defs/StatusDef.js";
import { Modifier, ModifierContext } from "./Modifier.js";

export abstract class StatusModifier extends Modifier {
    public readonly def: StatusDef;

    public override get label(): string {
        return this.def.label;
    }

    public override get canAttack(): boolean {
        return this.def.canAttack;
    }

    public override get canRetreat(): boolean {
        return this.def.canRetreat;
    }

    public constructor(def: StatusDef) {
        super();
        this.def = def;
    }

    protected override remove(context: ModifierContext) {
        context.card.removeStatus(this.def);
    }
};
