import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_ScoopUp extends TrainerWorker {
    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target = context.nextTarget();
        if (!target) {
            return this.generateInterrupt(context,
                "Which Pokémon will be returned?",
                context.player.pokemonInPlay.map(p => new Choice(p))
            );
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        const pokemon = context.nextTargetCard() as PokemonCard;
        if (pokemon.def.stage === "basic") {
            pokemon.owner.hand.add(pokemon);
            context.engine.send(...pokemon.fullTokens, "was returned to", context.player, "'s hand.");
        } else {
            const basic = pokemon.attachments.cards.find(c => c instanceof PokemonCard && c.def.stage === "basic")!;
            pokemon.owner.hand.add(basic);
            pokemon.discard();
            context.engine.send(...pokemon.fullTokens, "was discarded and", basic, "was returned to", context.player, "'s hand.");
        }
    }
};
