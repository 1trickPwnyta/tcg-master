import { EnergyCard } from "../../EnergyCard.js";
import { PokemonCard } from "../../PokemonCard.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.AttachEnergy)
export class InterruptWorker_AttachEnergy extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, energy_id: number): boolean {
        const target = context.engine.search.getCard(target_id) as PokemonCard;
        const energy = context.engine.search.getCard(energy_id) as EnergyCard;

        let override = false;
        for (const pokemon of target.owner.pokemonInPlay) {
            for (const modifier of pokemon.modifiers) {
                if (modifier.modifier.overrideAllowPlayEnergy({
                    engine: context.engine,
                    owner: pokemon.owner,
                    card: pokemon
                }, energy, target)) {
                    override = true;
                    break;
                }
            }
        }

        if (context.engine.game.turn?.energyPlayed && !override) {
            context.engine.sendError(target.owner, "You already played an Energy card this turn.");
            return false;
        }

        target.attachments.add(energy);
        context.engine.send(context.engine.game.activePlayer, "attached", context.engine.search.getCard(energy_id)!, "to", target, ".");
        if (!override) {
            context.engine.game.turn!.energyPlayed = true;
        }
        return true;
    }
};
