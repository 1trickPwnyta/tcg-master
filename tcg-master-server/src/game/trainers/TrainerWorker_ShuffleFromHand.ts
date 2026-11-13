import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_ShuffleFromHand extends TrainerWorker {
    private readonly amount: number;
    private readonly required: boolean;

    public constructor(args: any) {
        super();
        this.amount = args.amount;
        this.required = args.required ?? false;
    }

    public override validate(context: TrainerContext): boolean {
        if (this.required && context.player.hand.count < this.amount) {
            context.engine.sendError(context.player, "You don't have enough cards to shuffle into your deck.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, ...targets: number[]): Interrupt | null {
        if (targets.length < this.amount && context.player.hand.count) {
            return this.generateInterrupt(context,
                "Pick a card to shuffle into your deck.",
                context.player.hand.cards.map(c => new Choice(c))
            );
        }

        return null;
    }

    public override execute(context: TrainerContext, ...targets: number[]) {
        for (const target of targets) {
            const card = context.engine.search.getCard(target, context.player.limbo)!;
            context.player.deck.add(card);
        }
        context.player.deck.shuffle();
    }
};
