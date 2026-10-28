import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.EndTurn)
export class StateWorker_EndTurn extends StateWorker {
    public override execute(context: StateContext) {
        context.game.endTurn();
    }
};
