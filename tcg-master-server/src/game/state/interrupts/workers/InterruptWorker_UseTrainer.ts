import { TrainerCardDef } from "../../../../defs/TrainerCardDef.js";
import { DefDatabase } from "../../../../defs/DefDatabase.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.UseTrainer)
export class InterruptWorker_UseTrainer extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, card_id: number): boolean {
        const card = context.game.search.getCard(card_id);
        if (card) {
            const def = DefDatabase.get<TrainerCardDef>(card.def);
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
