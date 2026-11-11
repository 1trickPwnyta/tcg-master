import { TrainerCardDef } from "../../defs/TrainerCardDef.js";
import { Modifier, ModifierContext } from "./Modifier.js";

export abstract class ModifierTrainer extends Modifier {
    public readonly def: TrainerCardDef;

    public constructor(def: TrainerCardDef) {
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
