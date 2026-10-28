import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.MoveCard)
export class StateWorker_MoveCard extends StateWorker {
    public override execute(context: StateContext, card_id: string, from_id: string, to_id: string) {
        context.game.moveCard(card_id, from_id, to_id);
    }
};
