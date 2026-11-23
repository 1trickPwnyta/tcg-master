import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "./TrainerContext.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_ShuffleFromHand extends TrainerWorker {
    private readonly amount: number;
    private readonly required: boolean;
    private readonly kind?: "pokemon" | "trainer" | "energy";
    private readonly reveal: boolean;
    private readonly shuffle: boolean;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.required = args.required ?? false;
        this.kind = args.kind;
        this.reveal = args.reveal ?? false;
        this.shuffle = args.shuffle ?? true;
    }

    private getTargetChoices(context: TrainerContext): Choice[] {
        return this.getValidChoices(context, context.player.hand.cards.filter(c => !this.kind || c.def.kind === this.kind).map(c => new Choice(c)));
    }

    public override validate(context: TrainerContext): AcceptanceReport {
        if (this.required && this.getTargetChoices(context).length < this.amount) {
            return AcceptanceReport.Rejected("You don't have enough cards to shuffle into your deck.");
        }

        return AcceptanceReport.Accepted;
    }

    public override acquireTargets(context: TrainerContext): Interrupt | null {
        for (let i = 0; i < this.amount; i++) {
            const target = context.nextTarget();
            if (!target) {
                const choices = this.getTargetChoices(context);
                if (choices.length) {
                    return this.generateInterrupt(context)
                        .withPrompt("Pick a card to shuffle into your deck.")
                        .withChoices(choices);
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
                context.player.deck.add(target);
                if (this.reveal) {
                    context.engine.sendTo(context.player.opponent, context.player, "put", target, "into", context.player.pronouns.possessive, "deck from", context.player.pronouns.possessive, "hand.");
                }
            }
        }
        if (this.shuffle) {
            context.player.deck.shuffle();
        }
    }
};
