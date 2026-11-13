import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { ModifierContext } from "./Modifier.js";
import { StatusModifier } from "./StatusModifier.js";

export class Modifier_Confusion extends StatusModifier {
    public override notify_given(context: ModifierContext) {
        context.engine.send(...context.card.fullTokens, "got confused!");
    }

    public override notify_removed(context: ModifierContext) {
        context.engine.send(...context.card.fullTokens, "is no longer confused!");
    }

    public override try_attack(context: ModifierContext): boolean {
        context.engine.send(...context.card.fullTokens, "is confused.");
        if (context.engine.game.flipCoin(context.owner)) {
            return true;
        } else {
            context.card.dealDamage({
                amount: 20,
                attacker: context.card,
                type: context.card.def.type,
                source: "confusion"
            })
            return false;
        }
    }

    public override try_retreat(context: ModifierContext): boolean {
        context.engine.send(...context.card.fullTokens, "is confused.");
        if (context.engine.game.flipCoin(context.owner)) {
            return true;
        } else {
            context.engine.send(...context.card.fullTokens, "couldn't retreat.");
            context.card.giveStatus(DefDatabase.get<StatusDef>("FailedRetreat"));
            return false;
        }
    }
};
