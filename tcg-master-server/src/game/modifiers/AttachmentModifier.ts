import { CardDef } from "../../defs/CardDef.js";
import { Modifier, ModifierContext } from "./Modifier.js";

export abstract class AttachmentModifier extends Modifier {
    public readonly def: CardDef;

    public constructor(def: CardDef) {
        super();
        this.def = def;
    }

    public override get label(): string {
        return this.def.label;
    }

    public override get canAttack(): boolean {
        return true;
    }

    public override get canRetreat(): boolean {
        return true;
    }

    protected override remove(context: ModifierContext) {
        context.card.attachments.cards.find(c => c.def == this.def)?.discard();
    }
};
