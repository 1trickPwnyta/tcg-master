import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { PokemonPowerContext, PokemonPowerWorker } from "./PokemonPowerWorker.js";

export class PokemonPower_DamageSwap extends PokemonPowerWorker {
    public override cantUseReason(context: PokemonPowerContext): string | null {
        if (this.hasDisqualifyingStatus(context.card)) {
            return "a status condition";
        } else if (!context.owner.pokemonInPlay.some(p => p.damage)) {
            return "no damage on any Pokémon";
        }

        return null;
    }

    public override acquireTargets(context: PokemonPowerContext, source_id: number, amount: number, target_id: number): Interrupt | null {
        if (!source_id) {
            return this.generateInterrupt(context)
                .withPrompt("Select a Pokémon to swap damage away from.")
                .withChoices(context.owner.pokemonInPlay.filter(p => p.damage).map(p => new Choice(p)));
        } else {
            const source = context.engine.search.getCard(source_id) as PokemonCard;
            if (!amount) {
                return this.generateInterrupt(context)
                    .withPrompt("How much damage will you swap away from", source, "?")
                    .withChoices(Array.from({ length: source.damage / 10 }, (_, i) => Choice.fromInt((i + 1) * 10)));
            } else if (!target_id) {
                return this.generateInterrupt(context)
                    .withPrompt("Which Pokémon will receive the", amount, "damage?")
                    .withChoices(context.owner.pokemonInPlay.filter(p => p.id !== source_id && p.remainingHealth > amount).map(p => new Choice(p)));
            }
        }

        return null;
    }

    public override execute(context: PokemonPowerContext, source_id: number, amount: number, target_id: number): void {
        const source = context.engine.search.getCard(source_id) as PokemonCard;
        const target = context.engine.search.getCard(target_id) as PokemonCard;
        source.damage -= amount;
        target.damage += amount;
        context.engine.send(context.owner, "moved", amount, "damage from", source, "to", target, ".");
    }
};
