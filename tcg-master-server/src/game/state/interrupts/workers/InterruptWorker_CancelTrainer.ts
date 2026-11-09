import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.CancelTrainer)
export class InterruptWorker_CancelTrainer extends InterruptWorker {
    public override execute(context: InterruptContext, player_id: number, card_id: number): boolean {
        const player = context.engine.game.getPlayer(player_id)!;
        const card = context.engine.search.getCard(card_id)!;
        player.hand.add(card);
        return true;
    }
};
