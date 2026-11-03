import { CardDatabase } from "../../cards/CardDatabase.js";
import { CardWorker_Trainer } from "../../cards/workers/CardWorker_Trainer.js";
import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.UseTrainer)
export class StateWorker_UseTrainer extends StateWorker {
    public override execute(context: StateContext, target_id: number, card_id: number): boolean {
        const card = context.game.search.getCard(card_id);
        if (card) {
            const worker = CardDatabase.find<CardWorker_Trainer>(card.dbid);
            context.game.send(context.game.players.active, "used", card, ".");
            worker.execute({
                game: context.game,
                state: context.state,
                player: context.game.players.active,
                card: card
            }, target_id);
            context.game.moveCard(card.id, context.game.players.active.limbo.id, context.game.players.active.discard.id);
        } else {
            throw new Error("Can't find the Trainer card used.");
        }
        return true;
    }
};
