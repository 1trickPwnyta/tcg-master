import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.CancelTrainer)
export class InterruptWorker_CancelTrainer extends InterruptWorker {
    public override execute(context: InterruptContext, player_id: number, card_id: number): boolean {
        const player = context.game.players.get(player_id)!;
        context.game.cards.move(card_id, player.limbo.id, player.hand.id);
        return true;
    }
};
