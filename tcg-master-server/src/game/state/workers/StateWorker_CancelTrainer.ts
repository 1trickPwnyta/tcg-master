import { InterruptResolution } from "../interrupts/InterruptResolution.js";
import { ResolvesInterrupt } from "../interrupts/InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.CancelTrainer)
export class StateWorker_CancelTrainer extends StateWorker {
    public override execute(context: StateContext, player_id: number, card_id: number): boolean {
        const player = context.game.players.get(player_id)!;
        context.game.cards.move(card_id, player.limbo.id, player.hand.id);
        return true;
    }
};
