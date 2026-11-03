import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.UseMulliganBonus)
export class StateWorker_UseMulliganBonus extends StateWorker {
    public override execute(context: StateContext, amount: number, player_id: number): boolean {
        context.game.draw(player_id, amount);
        context.game.getPlayer(player_id).mulliganBonusUsed = true;
        return true;
    }
};
