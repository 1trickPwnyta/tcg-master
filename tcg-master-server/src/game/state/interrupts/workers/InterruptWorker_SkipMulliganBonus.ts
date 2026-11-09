import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.SkipMulliganBonus)
export class InterruptWorker_SkipMulliganBonus extends InterruptWorker {
    public override execute(context: InterruptContext, player_id: number): boolean {
        context.engine.game.getPlayer(player_id).mulliganBonusUsed = true;
        return true;
    }
};
