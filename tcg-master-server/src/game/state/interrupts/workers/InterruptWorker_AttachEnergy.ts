import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.AttachEnergy)
export class InterruptWorker_AttachEnergy extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, energy_id: number): boolean {
        const pokemon = context.engine.search.getCard(target_id)!;
        context.engine.cards.move(energy_id, context.engine.players.active.hand.id, pokemon.attachments.id);
        context.engine.send(context.engine.players.active, "attached", context.engine.search.getCard(energy_id)!, "to", pokemon, ".");
        context.engine.state.turn!.energyPlayed = true;
        return true;
    }
};
