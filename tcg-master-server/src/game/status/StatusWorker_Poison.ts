import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Poison extends StatusWorker {
    public override notify_given(context: StatusContext): void {
        context.engine.send(...context.card.fullTokens, "was poisoned!");
    }

    public override notify_endOfTurn(context: StatusContext): void {
        context.card.dealDamage({ amount: 10, source: "poison" });
    }
};
