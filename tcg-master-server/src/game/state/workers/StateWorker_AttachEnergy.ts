import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.AttachEnergy)
export class StateWorker_AttachEnergy extends StateWorker {
    public override execute(context: StateContext, target_id: string, energy_id: string): boolean {
        const pokemon = context.game.findCard(target_id)!;
        context.game.moveCard(energy_id, context.game.activePlayer.hand.id, pokemon.attachments.id);
        context.game.send(context.game.activePlayer, "attached", context.game.findCard(energy_id)!, "to", pokemon, ".");
        context.state.turn!.energyPlayed = true;
        return true;
    }
};
