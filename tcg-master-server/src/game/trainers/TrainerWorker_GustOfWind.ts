import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_GustOfWind extends TrainerWorker {
    private getTargetChoices(context: TrainerContext): Choice[] {
        return this.getValidChoices(context, context.player.opponent.bench.cards.map(c => new Choice(c)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!context.player.opponent.bench.count) {
            return AcceptanceReport.Rejected("Your opponent doesn't have any benched Pokémon.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target = context.nextTarget();
        if (!target) {
            return this.generateInterrupt(context,
                "Which of your opponent's Pokémon will switch in?",
                this.getTargetChoices(context)
            );
        }
        
        return null;
    }

    public execute(context: TrainerContext) {
        const card = context.nextTargetCard() as PokemonCard;
        context.player.opponent.bench.add(context.player.opponent.activePokemon!);
        context.player.opponent.active.add(card);
        context.engine.send(...card.fullTokens, " was forced out!");
    }
};
