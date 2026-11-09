import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.MoveCard)
export class InterruptWorker_MoveCard extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number, _from_id: number, to_id: number): boolean {
        const to = context.engine.search.getLocation(to_id)!;
        const card = context.engine.search.getCard(card_id)!;
        to.add(card);
        return true;
    }
};
