import { ModifierContext } from "./Modifier.js";
import { ModifierStatus } from "./ModifierStatus.js";

export class Modifier_Paralysis extends ModifierStatus {
    public override notify_given(context: ModifierContext): void {
        context.engine.send(...context.card.fullTokens, "was paralyzed!");
    }

    public override notify_endOfTurn(context: ModifierContext, turn_id: number): void {
        if (context.owner.id === turn_id) {
            context.engine.send(...context.card.fullTokens, "was cured of paralysis!");
            this.remove(context);
        }
    }
};
