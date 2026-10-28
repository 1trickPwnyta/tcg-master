import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.CompleteSetup)
export class StateWorker_CompleteSetup extends StateWorker {
    public override execute(context: StateContext, player_id: string) {
        context.state.players.find(p => p.id === player_id)!.setupComplete = true;
    }
};
