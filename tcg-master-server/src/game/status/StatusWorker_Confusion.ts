import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Confusion extends StatusWorker {
    protected override notify_given(context: StatusContext): void {
        context.engine.send(...context.card.fullTokens, "got confused!");
    }

    public override try_attack(context: StatusContext): boolean {
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

    public override try_retreat(context: StatusContext): boolean {
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
