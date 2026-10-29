import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.SkipMulliganBonus)
export class StateWorker_SkipMulliganBonus extends StateWorker {
    public override execute(context: StateContext, player_id: string): boolean {
        context.game.getPlayer(player_id).mulliganBonusUsed = true;
        return true;
    }
};
