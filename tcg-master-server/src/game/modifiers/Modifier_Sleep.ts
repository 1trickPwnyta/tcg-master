import { ModifierContext } from "./Modifier.js";
import { ModifierStatus } from "./ModifierStatus.js";


export class Modifier_Sleep extends ModifierStatus {
    public override notify_given(context: ModifierContext): void {
        context.engine.send(...context.card.fullTokens, "fell asleep!");
    }

    public override notify_endOfTurn(context: ModifierContext): void {
        context.engine.send(...context.card.fullTokens, "is asleep.");
        if (context.engine.game.flipCoin(context.owner)) {
            context.engine.send(...context.card.fullTokens, "woke up!");
            this.remove(context);
        }
    }
};
