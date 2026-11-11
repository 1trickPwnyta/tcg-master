import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_Discard extends TrainerWorker {
    private readonly amount: number | "all";

    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override validateTargets(context: TrainerContext, ...targets: number[]): Interrupt | "fail" | null {
        this.storeInLimbo(context, ...targets);

        if (this.amount !== "all" && context.player.hand.count < this.amount) {
            context.engine.sendError(context.player, "You don't have enough cards in your hand to discard.");
            return "fail";
        } else if (this.amount !== "all" && targets.length < this.amount) {
            return {
                player: context.player.id,
                prompt: "Select a card from your hand to discard.",
                choices: context.player.hand.cards.map(c => new Choice(c)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id, ...targets ]
            };
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
                const card = context.engine.search.getCard(target, context.player.hand)!;
                card.discard();
            }
        }
    }
};
