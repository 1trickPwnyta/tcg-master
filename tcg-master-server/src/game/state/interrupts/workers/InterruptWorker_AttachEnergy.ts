import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.AttachEnergy)
export class InterruptWorker_AttachEnergy extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, energy_id: number): boolean {
        const pokemon = context.game.search.getCard(target_id)!;
        context.game.cards.move(energy_id, context.game.players.active.hand.id, pokemon.attachments.id);
        context.game.send(context.game.players.active, "attached", context.game.search.getCard(energy_id)!, "to", pokemon, ".");
        context.state.turn!.energyPlayed = true;
        return true;
    }
};
