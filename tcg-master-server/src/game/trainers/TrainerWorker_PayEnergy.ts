import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_PayEnergy extends TrainerWorker {
    private readonly amount: number;

    public constructor(args: any) {
        super();
        this.amount = args?.amount ?? 1;
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!context.player.pokemonInPlay.some(p => p.attachments.energyCards.length >= this.amount)) {
            return AcceptanceReport.Rejected("None of your Pokémon have enough energy cards to pay for this trainer.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target_pokemon = context.nextTargetCard() as PokemonCard | null;
        if (!target_pokemon) {
            return this.generateInterrupt(context,
                "Select one of your Pokémon to discard energy from to pay for this trainer.",
                context.player.pokemonInPlay.filter(p => p.attachments.energyCards.length >= this.amount).map(p => new Choice(p))
            );
        }

        for (let i = 0; i < this.amount; i++) {
            const target_energy = context.nextTarget();
            if (!target_energy) {
                return this.generateInterrupt(context,
                    `Select an energy card to discard from ${target_pokemon.name} to pay for this trainer.`,
                    target_pokemon.attachments.energyCards.map(c => new Choice(c.card))
                );
            }
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        context.nextTarget(); // Ignore target pokemon
        for (let i = 0; i < this.amount; i++) {
            const card = context.nextTargetCard()!;
            card.discard();
        }
    }
};
