import { Choice } from "../Choice.js";
import { PokemonCardWrapper } from "../../PokemonCardWrapper.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";
import { MenuOption } from "../MenuOption.js";
import { InterruptSync } from "../Interrupt.js";

@ResolvesInterrupt(InterruptResolution.DiscardWrapper)
export class InterruptWorker_DiscardWrapper extends InterruptWorker {
    public override execute(context: InterruptContext, target: number | MenuOption.DiscardTrainerPokemon): boolean {
        const player = context.engine.game.activePlayer;
        if (target === MenuOption.DiscardTrainerPokemon) {
            context.engine.interrupts.interrupt(new InterruptSync(player)
                .withPrompt("Discard which trainer card Pokémon?")
                .withChoices(player.pokemonInPlay.filter(p => p instanceof PokemonCardWrapper).map(p => new Choice(p)))
                .withResolution(InterruptResolution.DiscardWrapper));
        } else {
            const card = context.engine.search.getCard(target)!;
            card.discard();
            context.engine.sendTo(player.opponent, player, "discarded", card, "from play.");
        }

        return true;
    }
};
