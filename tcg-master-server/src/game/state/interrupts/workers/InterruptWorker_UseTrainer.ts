import { TrainerCard } from "../../TrainerCard.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.UseTrainer)
export class InterruptWorker_UseTrainer extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, card_id: number): boolean {
        const card = context.engine.search.getCard(card_id) as TrainerCard;
        if (card) {
            context.engine.send(context.engine.game.activePlayer, "used", card, ".");
            card.execute({
                engine: context.engine,
                player: card.owner,
                card: card
            }, target_id);
            context.engine.game.activePlayer.discard.add(card);
        } else {
            throw new Error("Can't find the Trainer card used.");
        }
        return true;
    }
};
