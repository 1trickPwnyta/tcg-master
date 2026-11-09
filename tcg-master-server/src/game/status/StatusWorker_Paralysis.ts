import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Paralysis extends StatusWorker {
    public override notify_given(context: StatusContext): void {
        context.engine.send(...context.card.fullTokens, "was paralyzed!");
    }

    public override notify_endOfTurn(context: StatusContext, turn_id: number): void {
        if (context.owner.id === turn_id) {
            context.engine.send(...context.card.fullTokens, "was cured of paralysis!");
            this.remove(context);
        }
    }
};
