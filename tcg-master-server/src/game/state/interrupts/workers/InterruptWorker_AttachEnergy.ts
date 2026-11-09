import { PokemonCard } from "../../PokemonCard.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.AttachEnergy)
export class InterruptWorker_AttachEnergy extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, energy_id: number): boolean {
        const pokemon = context.engine.search.getCard(target_id) as PokemonCard;
        const energy = context.engine.search.getCard(energy_id)!;
        pokemon.attachments.add(energy);
        context.engine.send(context.engine.game.activePlayer, "attached", context.engine.search.getCard(energy_id)!, "to", pokemon, ".");
        context.engine.game.turn!.energyPlayed = true;
        return true;
    }
};
