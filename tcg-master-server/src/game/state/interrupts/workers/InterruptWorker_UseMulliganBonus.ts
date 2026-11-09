import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.UseMulliganBonus)
export class InterruptWorker_UseMulliganBonus extends InterruptWorker {
    public override execute(context: InterruptContext, amount: number, player_id: number): boolean {
        const player = context.engine.game.getPlayer(player_id);
        player.draw(amount);
        context.engine.game.getPlayer(player_id).mulliganBonusUsed = true;
        return true;
    }
};
