import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
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

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!context.player.opponent.pokemonInPlay.some(p => p.energy.length)) {
            return AcceptanceReport.Rejected("Your opponent doesn't have any Pokémon with energy attached.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target_pokemon = context.nextTargetCard() as PokemonCard | null;
        if (!target_pokemon) {
            return this.generateInterrupt(context,
                "Select one of your opponent's Pokémon to target.",
                context.player.opponent.pokemonInPlay.filter(p => p.energy.length).map(p => new Choice(p)),
            );
        }
        
        for (let i = 0; i < this.amount; i++) {
            const energy = context.nextTarget();
            if (energy === undefined) {
                const energyChoices = target_pokemon.attachments.energyCards.filter(c => !context.targets.includes(c.card.id));
                if (energyChoices.length) {
                    return this.generateInterrupt(context,
                        "Select an energy card to discard.",
                        energyChoices.map(e => new Choice(e.card)),
                    );
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
