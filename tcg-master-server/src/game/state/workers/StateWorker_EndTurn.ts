import { InterruptResolution } from "../interrupts/InterruptResolution.js";
import { ResolvesInterrupt } from "../interrupts/InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.EndTurn)
export class StateWorker_EndTurn extends StateWorker {
    public override execute(context: StateContext): boolean {
        context.game.turns.end();
        return true;
    }
};
