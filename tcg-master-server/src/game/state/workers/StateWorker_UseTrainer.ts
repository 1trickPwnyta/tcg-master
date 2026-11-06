import { CardDef_Trainer } from "../../../defs/CardDef_Trainer.js";
import { DefDatabase } from "../../../defs/DefDatabase.js";
import { InterruptResolution } from "../interrupts/InterruptResolution.js";
import { ResolvesInterrupt } from "../interrupts/InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.UseTrainer)
export class StateWorker_UseTrainer extends StateWorker {
    public override execute(context: StateContext, target_id: number, card_id: number): boolean {
        const card = context.game.search.getCard(card_id);
        if (card) {
            const def = DefDatabase.get<CardDef_Trainer>(card.def);
            context.game.send(context.game.players.active, "used", card, ".");
            def.execute({
                game: context.game,
                state: context.state,
                player: context.game.players.active,
                card: card
            }, target_id);
            context.game.cards.move(card.id, context.game.players.active.limbo.id, context.game.players.active.discard.id);
        } else {
            throw new Error("Can't find the Trainer card used.");
        }
        return true;
    }
};
