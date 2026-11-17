import { Choice } from "../../Choice.js";
import { PokemonCardWrapper } from "../../PokemonCardWrapper.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { ResolvesInterrupt } from "../InterruptResolver.js";
import { InterruptContext, InterruptWorker } from "./InterruptWorker.js";

@ResolvesInterrupt(InterruptResolution.DiscardWrapper)
export class InterruptWorker_DiscardWrapper extends InterruptWorker {
    public override execute(context: InterruptContext, target: number | null): boolean {
        const player = context.engine.game.activePlayer;
        if (!target) {
            context.engine.interrupts.interrupt({
                player: player.id,
                prompt: "Discard which trainer card Pokémon?",
                choices: player.pokemonInPlay.filter(p => p instanceof PokemonCardWrapper).map(p => new Choice(p)),
                resolution: InterruptResolution.DiscardWrapper
            });
        } else {
            const card = context.engine.search.getCard(target)!;
            card.discard();
            context.engine.sendTo(player.opponent, player, "discarded", card, "from play.");
        }

        return true;
    }
};
