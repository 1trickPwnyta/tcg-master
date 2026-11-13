import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";


export class Modifier_Sleep extends StatusModifier {
    public override notify_given(context: ModifierContext) {
        context.engine.send(...context.card.fullTokens, "fell asleep!");
    }

    public override notify_removed(context: ModifierContext) {
        context.engine.send(...context.card.fullTokens, "woke up!");
    }

    public override notify_endOfTurn(context: ModifierContext) {
        context.engine.send(...context.card.fullTokens, "is asleep.");
        if (context.engine.game.flipCoin(context.owner)) {
            this.remove(context);
        }
    }
};
