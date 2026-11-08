import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Paralysis extends StatusWorker {
    protected override notify_given(context: StatusContext): void {
        const owner = context.engine.players.get(context.owner_id);
        const card = context.engine.search.getCard(context.card_id);
        context.engine.send(owner, "'s", card, "was paralyzed!");
    }

    public override notify_endOfTurn(context: StatusContext, turn_id: number): void {
        if (context.owner_id === turn_id) {
            const owner = context.engine.players.get(context.owner_id);
            const card = context.engine.search.getCard(context.card_id);
            context.engine.send(owner, "'s", card, "was cured of paralysis!");
            this.remove(context);
        }
    }
};
