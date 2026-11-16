import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Discard extends TrainerWorker {
    private readonly amount: number | "all";

    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (this.amount !== "all" && context.player.hand.count < this.amount) {
            return AcceptanceReport.Rejected("You don't have enough cards in your hand to discard.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        if (this.amount !== "all") {
            for (let i = 0; i < this.amount; i++) {
                const target = context.nextTarget();
                if (!target) {
                    return this.generateInterrupt(context,
                        "Select a card from your hand to discard.",
                        context.player.hand.cards.map(c => new Choice(c))
                    );
                }
            }
        }

        return null;
    }

    public override execute(context: TrainerContext): void {
        if (this.amount === "all") {
            while (context.player.hand.count) {
                context.player.hand.cards[0].discard();
            }
        } else {
            for (let i = 0; i < this.amount; i++) {
                const card = context.nextTargetCard()!;
                card.discard();
            }
        }
    }
};
