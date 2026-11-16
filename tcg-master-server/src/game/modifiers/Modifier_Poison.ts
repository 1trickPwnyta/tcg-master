import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_Poison extends StatusModifier {
    public override notify_given(context: ModifierContext) {
        context.engine.send(...context.card.fullTokens, "was poisoned!");
    }

    public override notify_removed(context: ModifierContext) {
        context.engine.send(...context.card.fullTokens, "is no longer poisoned!");
    }

    public override notify_betweenTurns(context: ModifierContext, args?: any) {
        context.card.dealDamage({ amount: args?.amount ?? 10, source: "poison" });
    }
};
