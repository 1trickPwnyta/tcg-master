import { InterruptResolution } from "../../InterruptResolution.js";
import { ResolvesInterrupt } from "../../InterruptResolver.js";
import { StateContext, StateWorker } from "./StateWorker.js";

@ResolvesInterrupt(InterruptResolution.AttachEnergy)
export class StateWorker_AttachEnergy extends StateWorker {
    public override execute(context: StateContext, card_id: string, pokemon_id: string) {
        const pokemon = context.game.findCard(pokemon_id)!;
        context.game.moveCard(card_id, context.game.activePlayer.hand.id, pokemon.attachments.id);
        context.game.send(context.game.activePlayer, "attached", context.game.findCard(card_id)!, "to", pokemon, ".");
    }
};
