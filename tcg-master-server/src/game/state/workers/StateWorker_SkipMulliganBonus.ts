import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.SkipMulliganBonus)
export class StateWorker_SkipMulliganBonus extends StateWorker {
    public override execute(context: StateContext, player_id: number): boolean {
        context.game.players.get(player_id).mulliganBonusUsed = true;
        return true;
    }
};
