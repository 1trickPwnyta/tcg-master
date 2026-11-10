import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Sleep extends StatusWorker {
    public override notify_given(context: StatusContext): void {
        context.engine.send(...context.card.fullTokens, "fell asleep!");
    }

    public override notify_endOfTurn(context: StatusContext): void {
        context.engine.send(...context.card.fullTokens, "is asleep.");
        if (context.engine.game.flipCoin(context.owner)) {
            context.engine.send(...context.card.fullTokens, "woke up!");
            this.remove(context);
        }
    }
};
