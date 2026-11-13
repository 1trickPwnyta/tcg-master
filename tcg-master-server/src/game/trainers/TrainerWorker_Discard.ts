import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Discard extends TrainerWorker {
    private readonly amount: number | "all";

    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override validate(context: TrainerContext): boolean {
        if (this.amount !== "all" && context.player.hand.count < this.amount) {
            context.engine.sendError(context.player, "You don't have enough cards in your hand to discard.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, ...targets: number[]): Interrupt | null {
        if (this.amount !== "all" && targets.length < this.amount) {
            return this.generateInterrupt(context,
                "Select a card from your hand to discard.",
                context.player.hand.cards.map(c => new Choice(c))
            );
        }

        return null;
    }

    public override execute(context: TrainerContext, ...targets: number[]): void {
        if (this.amount === "all") {
            while (context.player.hand.count) {
                context.player.hand.cards[0].discard();
            }
        } else {
            for (const target of targets) {
                const card = context.engine.search.getCard(target, context.player.limbo)!;
                card?.discard();
            }
        }
    }
};
