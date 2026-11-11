import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.CancelTrainer)
export class InterruptWorker_CancelTrainer extends InterruptWorker {
    public override execute(context: InterruptContext, player_id: number): boolean {
        const player = context.engine.game.getPlayer(player_id)!;
        player.limbo.sendAllBack();
        return true;
    }
};
