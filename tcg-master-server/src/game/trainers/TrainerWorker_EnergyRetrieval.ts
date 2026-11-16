import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
import { EnergyCard } from "../state/EnergyCard.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_EnergyRetrieval extends TrainerWorker {
    private readonly amount: number;
    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!context.player.discard.cards.some(c => c instanceof EnergyCard && c.def.basic)) {
            return AcceptanceReport.Rejected("There are no basic energy cards in your discard pile.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        for (let i = 0; i < this.amount; i++) {
            if (context.player.discard.cards.some(c => c instanceof EnergyCard && c.def.basic)) {
                return this.generateInterrupt(context,
                    "Select a basic energy card from your discard pile.",
                    context.player.discard.cards.filter(c => c instanceof EnergyCard && c.def.basic).map(e => new Choice(e))
                );
            } else {
                context.addNullTarget();
            }
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        for (let i = 0; i < this.amount; i++) {
            const card = context.nextTargetCard();
            if (card) {
                context.player.hand.add(card);
                context.engine.sendTo(context.player.opponent, context.player, "recovered", card, ".");
            }
        }
    }
};
