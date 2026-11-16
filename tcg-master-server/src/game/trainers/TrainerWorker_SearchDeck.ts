import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_SearchDeck extends TrainerWorker {
    private readonly amount: number;
    private readonly kind?: "pokemon" | "trainer" | "energy";
    private readonly reveal: boolean;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.kind = args.kind;
        this.reveal = args.reveal ?? false;
    }

    private getTargetChoices(context: TrainerContext): Choice[] {
        return this.getValidChoices(context, context.player.deck.cards.filter(c => !this.kind || c.def.kind === this.kind).map(c => new Choice(c)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (!context.player.deck.count) {
            return AcceptanceReport.Rejected("There are no cards left in your deck.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        for (let i = 0; i < this.amount; i++) {
            const target = context.nextTarget();
            if (target === undefined) {
                const choices = this.getTargetChoices(context);
                if (choices.length) {
                    return this.generateInterrupt(context,
                        "Select a card from your deck.",
                        choices
                    );
                } else {
                    context.addNullTarget();
                }
            }
        }

        return null;
    }

    public override execute(context: TrainerContext) {
        for (let i = 0; i < this.amount; i++) {
            const target = context.nextTargetCard();
            if (target) {
                context.player.hand.add(target);
                if (this.reveal) {
                    context.engine.sendTo(context.player.opponent, context.player, "put", target, "from", context.player.pronouns.possessive, "deck into", context.player.pronouns.possessive, "hand.");
                }
            }
        }
        context.player.deck.shuffle();
    }
};
