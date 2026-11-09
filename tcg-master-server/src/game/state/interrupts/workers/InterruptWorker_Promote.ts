import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.Promote)
export class InterruptWorker_Promote extends InterruptWorker {
    public override execute(context: InterruptContext, card_id: number, player_id: number): boolean {
        const player = context.engine.game.getPlayer(player_id);
        const card = context.engine.search.getCard(card_id)!;
        if (player.activePokemon) {
            player.bench.add(player.activePokemon);
        }
        player.active.add(card);
        context.engine.send(player, "sent out", player.activePokemon, "!");
        return true;
    }
};
