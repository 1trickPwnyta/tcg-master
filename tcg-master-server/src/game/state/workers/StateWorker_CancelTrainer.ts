import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.CancelTrainer)
export class StateWorker_CancelTrainer extends StateWorker {
    public override execute(context: StateContext, player_id: number, card_id: number): boolean {
        const player = context.game.getPlayer(player_id)!;
        context.game.moveCard(card_id, player.limbo.id, player.hand.id);
        return true;
    }
};
