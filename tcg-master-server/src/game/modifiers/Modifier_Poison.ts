import { ModifierContext } from "./Modifier.js";
import { ModifierStatus } from "./ModifierStatus.js";

export class Modifier_Poison extends ModifierStatus {
    public override notify_given(context: ModifierContext): void {
        context.engine.send(...context.card.fullTokens, "was poisoned!");
    }

    public override notify_endOfTurn(context: ModifierContext): void {
        context.card.dealDamage({ amount: 10, source: "poison" });
    }
};
