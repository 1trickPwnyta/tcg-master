import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.SkipBench)
export class StateWorker_SkipBench extends StateWorker {
    public override execute(context: StateContext, player_id: string): boolean {
        context.state.players.find(p => p.id === player_id)!.setupComplete = true;
        return true;
    }
};
