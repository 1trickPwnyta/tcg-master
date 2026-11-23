import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Heal extends TrainerWorker {
    private readonly amount: number;
    private readonly discardEnergy: number;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.discardEnergy = args.discard_energy ?? 0;
    }

    private getTargetChoices(context: TrainerContext) {
        return this.getValidChoices(context, context.player.pokemonInPlay.filter(p => p.damage && (p.energy.length >= this.discardEnergy)).map(p => new Choice(p)));
    }

    private getEnergyChoices(context: TrainerContext, target: PokemonCard) {
        return this.getValidChoices(context, target.attachments.energyCards.map(e => new Choice(e.card)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!this.getTargetChoices(context).length) {
            return AcceptanceReport.Rejected("None of your Pokémon can be healed right now.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target = context.nextTargetCard() as PokemonCard | null;
        if (!target) {
            return this.generateInterrupt(context)
                .withPrompt("Heal which Pokémon?")
                .withChoices(this.getTargetChoices(context));
        }

        for (let i = 0; i < this.discardEnergy; i++) {
            const energy = context.nextTarget();
            if (!energy) {
                return this.generateInterrupt(context)
                    .withPrompt("Discard which energy card from", target, "?")
                    .withChoices(this.getEnergyChoices(context, target));
            }
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        const card = context.nextTargetCard() as PokemonCard;
        for (let i = 0; i < this.discardEnergy; i++) {
            const energyCard = context.nextTargetCard()!;
            energyCard.discard();
        }
        card.heal(this.amount);
    }
};
