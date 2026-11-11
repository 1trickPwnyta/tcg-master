import { Choice } from "../state/Choice.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
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

    public override validateTargets(context: TrainerContext, ...targets: number[]): Interrupt | "fail" | null {
        this.storeInLimbo(context, ...targets);

        if (this.required && context.player.hand.count < this.amount) {
            context.engine.sendError(context.player, "You don't have enough cards to shuffle into your deck.");
            return "fail";
        } else if (targets.length < this.amount && context.player.hand.count) {
            return {
                player: context.player.id,
                prompt: "Pick a card to shuffle into your deck.",
                choices: context.player.hand.cards.map(c => new Choice(c)),
                resolution: InterruptResolution.TrainerTargets,
                cancelResolution: InterruptResolution.CancelTrainer,
                args: [ context.card.id, ...targets ]
            };
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
