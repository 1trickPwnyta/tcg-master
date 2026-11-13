import { Choice } from "../../Choice.js";
import { PokemonCard } from "../../PokemonCard.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.UsePokemonPower)
export class InterruptWorker_UsePokemonPower extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number, card_id: number, key: string): boolean {
        const player = context.engine.game.activePlayer;

        if (card_id ?? target_id) {
            const card = context.engine.search.getCard(card_id ?? target_id) as PokemonCard;
            if (card_id) {
                context.compoundArgs[key] = target_id;
            }
            const power = card.def.power!;
            const powerContext = {
                engine: context.engine,
                owner: card.owner,
                card: card,
                args: context.compoundArgs ?? {}
            };

            const cantUseReason = power.cantUseReason(powerContext);
            if (cantUseReason) {
                context.engine.sendError(card.owner, card, "can't use", power, "due to", cantUseReason, ".");
                return false;
            }
            
            return power.use(powerContext);
        } else if (!player.pokemonInPlay.some(p => p.def.power?.executable)) {
            context.engine.sendError(player, "You have no Pokémon in play with a usable Pokémon power.");
            return false;
        } else {
            context.engine.interrupts.interrupt({
                player: player.id,
                prompt: "Use Pokémon power of which Pokémon?",
                choices: player.pokemonInPlay.filter(p => p.def.power?.executable).map(p => new Choice(p)),
                resolution: InterruptResolution.UsePokemonPower
            });
            return true;
        }
    }
};
