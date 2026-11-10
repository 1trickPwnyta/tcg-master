import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_EnergyRemoval extends TrainerWorker {
    public override validateTargets(context: TrainerContext, target_pokemon: number, target_energy: number): Interrupt | "fail" | null {
        if (!context.player.opponent.pokemonInPlay.some(p => p.energy.length)) {
            context.engine.sendError(context.player, "Your opponent doesn't have any Pokémon with energy attached.");
            return "fail";
        } else if (!target_pokemon) {
            return {
                player: context.player.id,
                prompt: "Select one of your opponent's Pokémon to target.",
                choices: context.player.opponent.pokemonInPlay.filter(p => p.energy.length).map(p => new Choice(p)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id ]
            };
        } else if (!target_energy) {
            const pokemon = context.engine.search.getCard(target_pokemon) as PokemonCard;
            return {
                player: context.player.id,
                prompt: "Select an energy card to discard.",
                choices: pokemon.energy.map(e => new Choice(e)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id, target_pokemon ]
            };
        }

        return null;
    }

    public override execute(context: TrainerContext, target_pokemon: number, target_energy: number) {
        const card = context.engine.search.getCard(target_energy)!;
        const pokemon = context.engine.search.getCard(target_pokemon) as PokemonCard;
        card.owner.discard.add(card);
        context.engine.send(card, "was discarded from", ...pokemon.fullTokens, ".");
    }
};
