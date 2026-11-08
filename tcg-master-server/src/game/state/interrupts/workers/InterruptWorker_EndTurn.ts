import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.EndTurn)
export class InterruptWorker_EndTurn extends InterruptWorker {
    public override execute(context: InterruptContext): boolean {
        context.engine.turns.end();
        return true;
    }
};
