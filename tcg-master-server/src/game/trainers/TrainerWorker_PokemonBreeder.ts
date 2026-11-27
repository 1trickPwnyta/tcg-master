import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_PokemonBreeder extends TrainerWorker {
    private getEvolutionChoices(context: TrainerContext): Choice[] {
        return this.getValidChoices(context, context.player.hand.cards
            .filter(c => c instanceof PokemonCard && c.def.stage === "stage2" && this.getBasicChoices(context, c).length).map(p => new Choice(p)));
    }

    private getBasicChoices(context: TrainerContext, evolution: PokemonCard): Choice[] {
        return this.getValidChoices(context, context.player.pokemonInPlay
            .filter(p => p.evolutionEligible && p.def.evolution?.evolvesEver(evolution.name)).map(p => new Choice(p)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!this.getEvolutionChoices(context).length) {
            return AcceptanceReport.Rejected("You have no Stage 2 evolution cards that can be used right now.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const evolution = context.nextTargetCard() as PokemonCard | null;
        if (!evolution) {
            return this.generateInterrupt(context)
                .withPrompt("Select a Stage 2 evolution card to play.")
                .withChoices(this.getEvolutionChoices(context));
        }

        const basic = context.nextTarget();
        if (!basic) {
            return this.generateInterrupt(context)
                .withPrompt("Choose a basic Pokémon to evolve into", evolution, ".")
                .withChoices(this.getBasicChoices(context, evolution));
        }

        return null;
    }

    public override execute(context: TrainerContext): void {
        const evolution = context.nextTargetCard() as PokemonCard;
        const basic = context.nextTargetCard() as PokemonCard;
        basic.evolve(evolution);
    }
};
