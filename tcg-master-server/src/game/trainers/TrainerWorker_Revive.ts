import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Revive extends TrainerWorker {
    private getTargetChoices(context: TrainerContext): Choice[] {
        return this.getValidChoices(context, context.player.discard.cards.filter(c => c instanceof PokemonCard && c.def.stage === "basic").map(c => new Choice(c)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!this.getTargetChoices(context).length) {
            return AcceptanceReport.Rejected("There are no basic Pokémon cards in your discard pile.");
        } else if (context.player.bench.full) {
            return AcceptanceReport.Rejected("Your bench is full.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const target = context.nextTarget();
        if (!target) {
            return this.generateInterrupt(context)
                .withPrompt("Select a basic Pokémon card from your discard pile.")
                .withChoices(this.getTargetChoices(context));
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        const card = context.nextTargetCard() as PokemonCard;
        context.player.bench.add(card);
        card.damage = Math.floor(card.def.hp / 20) * 10;
        context.engine.send(card, "was revived!");
    }
};
