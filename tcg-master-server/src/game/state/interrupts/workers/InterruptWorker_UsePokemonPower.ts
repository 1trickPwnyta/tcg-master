import { Choice } from "../Choice.js";
import { PokemonCard } from "../../PokemonCard.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";
import { MenuOption } from "../MenuOption.js";
import { InterruptSync } from "../Interrupt.js";

@ResolvesInterrupt(InterruptResolution.UsePokemonPower)
export class InterruptWorker_UsePokemonPower extends InterruptWorker {
    public override execute(context: InterruptContext, target_id: number | MenuOption.PokemonPower, card_id: number, key: string): boolean {
        const player = context.engine.game.activePlayer;

        if (card_id || (target_id && target_id !== MenuOption.PokemonPower)) {
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
                context.engine.sendError(card.owner, `${card.name} can't use ${power.name} due to ${cantUseReason}.`);
                return false;
            }
            
            return power.use(powerContext);
        } else if (!player.pokemonInPlay.some(p => p.def.power?.executable)) {
            context.engine.sendError(player, "You have no Pokémon in play with a usable Pokémon power.");
            return false;
        } else {
            context.engine.interrupts.interrupt(new InterruptSync(player)
                .withPrompt("Use Pokémon power of which Pokémon?")
                .withChoices(player.pokemonInPlay.filter(p => p.def.power?.executable).map(p => new Choice(p)))
                .withResolution(InterruptResolution.UsePokemonPower));
            return true;
        }
    }
};
