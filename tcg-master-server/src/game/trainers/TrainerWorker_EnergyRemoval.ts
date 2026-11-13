import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_EnergyRemoval extends TrainerWorker {
    public override validate(context: TrainerContext): boolean {
        if (!context.player.opponent.pokemonInPlay.some(p => p.energy.length)) {
            context.engine.sendError(context.player, "Your opponent doesn't have any Pokémon with energy attached.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, target_pokemon: number, target_energy: number): Interrupt | null {
        if (!target_pokemon) {
            return this.generateInterrupt(context,
                "Select one of your opponent's Pokémon to target.",
                context.player.opponent.pokemonInPlay.filter(p => p.energy.length).map(p => new Choice(p)),
            );
        } else if (!target_energy) {
            const pokemon = context.engine.search.getCard(target_pokemon) as PokemonCard;
            return this.generateInterrupt(context,
                "Select an energy card to discard.",
                pokemon.energy.map(e => new Choice(e)),
            );
        }

        return null;
    }

    public override execute(context: TrainerContext, target_pokemon: number, target_energy: number) {
        const card = context.engine.search.getCard(target_energy)!;
        const pokemon = context.engine.search.getCard(target_pokemon) as PokemonCard;
        card.discard();
        context.engine.send(card, "was discarded from", ...pokemon.fullTokens, ".");
    }
};
