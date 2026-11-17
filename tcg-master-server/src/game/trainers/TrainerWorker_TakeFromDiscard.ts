import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_TakeFromDiscard extends TrainerWorker {
    private readonly amount: number;
    private readonly kind?: "pokemon" | "trainer" | "energy";

    public constructor(args: any) {
        super();
        this.amount = args.amount ?? 1;
        this.kind = args.kind;
    }

    private getTargetChoices(context: TrainerContext): Choice[] {
        return this.getValidChoices(context, context.player.discard.cards.filter(c => !this.kind || c.def.kind === this.kind).map(c => new Choice(c)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!this.getTargetChoices(context).length) {
            return AcceptanceReport.Rejected("There are no cards to take from your discard pile.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        const choices = this.getTargetChoices(context);
        for (let i = 0; i < this.amount; i++) {
            const target = context.nextTarget();
            if (target === undefined) {
                if (choices.length) {
                    return this.generateInterrupt(context,
                        "Select a card from your discard pile.",
                        choices
                    );
                } else {
                    context.addNullTarget();
                }
            }
        }

        return null;
    }

    public override execute(context: TrainerContext): void {
        for (let i = 0; i < this.amount; i++) {
            const target = context.nextTargetCard();
            if (target) {
                context.player.hand.add(target);
                context.engine.sendTo(context.player.opponent, context.player, "put", target, "into", context.player.pronouns.possessive, "hand.");
            }
        }
    }
};
