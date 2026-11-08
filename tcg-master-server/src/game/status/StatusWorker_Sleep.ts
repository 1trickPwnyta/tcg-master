import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Sleep extends StatusWorker {
    protected override notify_given(context: StatusContext): void {
        const owner = context.engine.players.get(context.owner_id);
        const card = context.engine.search.getCard(context.card_id);
        context.engine.send(owner, "'s", card, "fell asleep!");
    }

    public override notify_endOfTurn(context: StatusContext): void {
        const owner = context.engine.players.get(context.owner_id);
        const card = context.engine.search.getCard(context.card_id);
        context.engine.send(owner, "'s", card, "is asleep.");
        if (context.engine.flipCoin(context.owner_id)) {
            context.engine.send(owner, "'s", card, "woke up!");
            this.remove(context);
        }
    }
};
