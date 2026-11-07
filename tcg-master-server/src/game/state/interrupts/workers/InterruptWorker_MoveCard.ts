import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.MoveCard)
export class InterruptWorker_MoveCard extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number, from_id: number, to_id: number): boolean {
        context.game.cards.move(card_id, from_id, to_id);
        return true;
    }
};
