import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_EnergyRemoval extends TrainerWorker {
    private readonly amount: number;

    public constructor(args: any) {
        super();
        this.amount = args?.amount ?? 1;
    }

    private getPokemonChoices(context: TrainerContext): Choice[] {
        return this.getValidChoices(context, context.player.opponent.pokemonInPlay.filter(p => p.energy.length).map(p => new Choice(p)));
    }

    private getEnergyChoices(context: TrainerContext, pokemon: PokemonCard): Choice[] {
        return this.getValidChoices(context, pokemon.attachments.energyCards.filter(c => !context.targets.includes(c.card.id)).map(c => new Choice(c.card)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!context.player.opponent.pokemonInPlay.some(p => p.energy.length)) {
            return AcceptanceReport.Rejected("Your opponent doesn't have any Pokémon with energy attached.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target_pokemon = context.nextTargetCard() as PokemonCard | null;
        if (!target_pokemon) {
            return this.generateInterrupt(context)
                .withPrompt("Select one of", context.player.opponent, "'s Pokémon to target.")
                .withChoices(this.getPokemonChoices(context));
        }
        
        for (let i = 0; i < this.amount; i++) {
            const energy = context.nextTarget();
            if (energy === undefined) {
                const energyChoices = this.getEnergyChoices(context, target_pokemon);
                if (energyChoices.length) {
                    return this.generateInterrupt(context)
                        .withPrompt("Select an energy card to discard.")
                        .withChoices(energyChoices);
                } else {
                    context.addNullTarget();
                }
            }
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        const target_pokemon = context.nextTargetCard() as PokemonCard;
        for (let i = 0; i < this.amount; i++) {
            const card = context.nextTargetCard();
            if (card) {
                card.discard();
                context.engine.send(card, "was discarded from", ...target_pokemon.fullTokens, ".");
            }
        }
    }
};
