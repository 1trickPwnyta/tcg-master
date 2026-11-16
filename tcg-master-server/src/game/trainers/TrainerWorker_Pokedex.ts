import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Pokedex extends TrainerWorker {
    public override validate(context: TrainerContext): AcceptanceReport {
        if (context.player.deck.count === 0) {
            return AcceptanceReport.Rejected("Your deck is empty.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        for (let i = 0; i < 5; i++) {
            const target = context.nextTarget();
            if (target === undefined) {
                context.forceInterrupt = true;
                return this.generateInterrupt(context,
                    i ? `Which card will go in position ${i + 1}?` : "Which card will go in position 1 (the top)?",
                    context.player.deck.cards.slice(-(5 - (i - 1))).map(c => new Choice(c))
                );
            }
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        for (let i = 0; i < 5; i++) {
            const target = context.nextTargetCard();
            if (target) {
                context.player.deck.cards.splice(context.player.deck.cards.indexOf(target), 1);
                context.player.deck.add(target);
            }
        }
    }
};
