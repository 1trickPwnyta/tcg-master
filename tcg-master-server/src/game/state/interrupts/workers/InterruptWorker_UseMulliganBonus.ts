import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.UseMulliganBonus)
export class InterruptWorker_UseMulliganBonus extends InterruptWorker {
    public override execute(context: InterruptContext, amount: number, player_id: number): boolean {
        context.engine.cards.draw(player_id, amount);
        context.engine.players.get(player_id).mulliganBonusUsed = true;
        return true;
    }
};
