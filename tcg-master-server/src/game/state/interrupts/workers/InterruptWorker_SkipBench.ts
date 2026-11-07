import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.SkipBench)
export class InterruptWorker_SkipBench extends InterruptWorker {
    public override execute(context: InterruptContext, player_id: number): boolean {
        context.state.players.find(p => p.id === player_id)!.setupComplete = true;
        return true;
    }
};
