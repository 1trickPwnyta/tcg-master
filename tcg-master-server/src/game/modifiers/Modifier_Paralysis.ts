import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_Paralysis extends StatusModifier {
    public override notify_given(context: ModifierContext) {
        context.engine.send(...context.card.fullTokens, "was paralyzed!");
    }

    public override notify_removed(context: ModifierContext) {
        context.engine.send(...context.card.fullTokens, "was cured of paralysis!");
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number) {
        if (context.owner.id === turn_id) {
            this.remove(context);
        }
    }
};
