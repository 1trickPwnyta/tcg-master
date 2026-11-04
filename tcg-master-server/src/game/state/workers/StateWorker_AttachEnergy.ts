import { InterruptResolution } from "../interrupts/InterruptResolution.js";
import { ResolvesInterrupt } from "../interrupts/InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.AttachEnergy)
export class StateWorker_AttachEnergy extends StateWorker {
    public override execute(context: StateContext, target_id: number, energy_id: number): boolean {
        const pokemon = context.game.search.getCard(target_id)!;
        context.game.cards.move(energy_id, context.game.players.active.hand.id, pokemon.attachments.id);
        context.game.send(context.game.players.active, "attached", context.game.search.getCard(energy_id)!, "to", pokemon, ".");
        context.state.turn!.energyPlayed = true;
        return true;
    }
};
