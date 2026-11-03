import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.Promote)
export class StateWorker_Promote extends StateWorker {
    public override execute(context: StateContext, card_id: number, player_id: number): boolean {
        const player = context.game.players.get(player_id);
        if (player.active.cards.length) {
            context.game.moveCard(player.active.cards[0].id, player.active.id, player.bench.id);
        }
        context.game.moveCard(card_id, player.bench.id, player.active.id);
        context.game.send(player, "sent out", player.active.cards[0], "!");
        return true;
    }
};
