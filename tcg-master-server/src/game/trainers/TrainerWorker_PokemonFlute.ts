import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_PokemonFlute extends TrainerWorker {
    private getTargetChoices(context: TrainerContext): Choice[] {
        return this.getValidChoices(context, context.player.opponent.discard.cards.filter(c => c instanceof PokemonCard && c.def.stage === "basic").map(c => new Choice(c)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (context.player.opponent.bench.full) {
            return AcceptanceReport.Rejected("Your opponent's bench is full.");
        } else if (!this.getTargetChoices(context).length) {
            return AcceptanceReport.Rejected("Your opponent has no basic Pokémon cards in their discard pile.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target = context.nextTarget();
        if (!target) {
            return this.generateInterrupt(context)
                .withPrompt("Which Pokémon will be sent to", context.player.opponent, "'s bench?")
                .withChoices(this.getTargetChoices(context));
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        const card = context.nextTargetCard() as PokemonCard;
        context.player.opponent.bench.add(card);
        context.engine.send(...card.fullTokens, "was brought back!");
    }
};
