import { TrainerCardDef } from "../../../../defs/TrainerCardDef.js";
import { DefDatabase } from "../../../../defs/DefDatabase.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.UseTrainer)
export class InterruptWorker_UseTrainer extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, card_id: number): boolean {
        const card = context.engine.search.getCard(card_id);
        if (card) {
            const def = DefDatabase.get<TrainerCardDef>(card.def);
            context.engine.send(context.engine.players.active, "used", card, ".");
            def.execute({
                engine: context.engine,
                player: context.engine.players.active,
                card: card
            }, target_id);
            context.engine.cards.move(card.id, context.engine.players.active.limbo.id, context.engine.players.active.discard.id);
        } else {
            throw new Error("Can't find the Trainer card used.");
        }
        return true;
    }
};
