import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Promote)
export class InterruptWorker_Promote extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number, player_id: number): boolean {
        const player = context.game.players.get(player_id);
        if (player.active.cards.length) {
            context.game.cards.move(player.active.cards[0].id, player.active.id, player.bench.id);
        }
        context.game.cards.move(card_id, player.bench.id, player.active.id);
        context.game.send(player, "sent out", player.active.cards[0], "!");
        return true;
    }
};
