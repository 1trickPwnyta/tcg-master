import { StatusContext, StatusWorker } from "./StatusWorker.js";

export class StatusWorker_Poison extends StatusWorker {
    protected override notify_given(context: StatusContext): void {
        const owner = context.engine.players.get(context.owner_id);
        const card = context.engine.search.getCard(context.card_id);
        context.engine.send(owner, "'s", card, "was poisoned!");
    }

    public override notify_endOfTurn(context: StatusContext): void {
        context.engine.pokemon.damage({
            owner_id: context.owner_id,
            card_id: context.card_id,
            amount: 10,
            source: "poison"
        });
    }
};
