import { InterruptResolution } from "../interrupts/InterruptResolution.js";
import { ResolvesInterrupt } from "../interrupts/InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.Promote)
export class StateWorker_Promote extends StateWorker {
    public override execute(context: StateContext, card_id: number, player_id: number): boolean {
        const player = context.game.players.get(player_id);
        if (player.active.cards.length) {
            context.game.cards.move(player.active.cards[0].id, player.active.id, player.bench.id);
        }
        context.game.cards.move(card_id, player.bench.id, player.active.id);
        context.game.send(player, "sent out", player.active.cards[0], "!");
        return true;
    }
};
