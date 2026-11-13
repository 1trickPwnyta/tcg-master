import { Choice } from "../state/Choice.js";
import { EnergyCard } from "../state/EnergyCard.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { Location } from "../state/Location.js";
import { TrainerContext } from "../state/TrainerCard.js";
import { TrainerWorker } from "./TrainerWorker.js";

export class TrainerWorker_EnergyRetrieval extends TrainerWorker {
    private readonly amount: number;
    public constructor(args: any) {
        super();
        this.amount = args.amount;
    }

    public override getTargetLocation(context: TrainerContext): Location {
        return context.player.discard;
    }

    public override validate(context: TrainerContext): boolean {
        if (!context.player.discard.cards.some(c => c instanceof EnergyCard && c.def.basic)) {
            context.engine.sendError(context.player, "There are no basic energy cards in your discard pile.");
            return false;
        }

        return true;
    }

    public override acquireTargets(context: TrainerContext, ...targets: number[]): Interrupt | null {
        if (targets.length < this.amount && context.player.discard.cards.some(c => c instanceof EnergyCard && c.def.basic)) {
            return this.generateInterrupt(context,
                "Select a basic energy card from your discard pile.",
                context.player.discard.cards.filter(c => c instanceof EnergyCard && c.def.basic).map(e => new Choice(e))
            );
        }

        return null;
    }

    public override execute(context: TrainerContext, ...targets: number[]) {
        for (const target of targets) {
            const card = context.engine.search.getCard(target)!;
            context.player.hand.add(card);
            context.engine.sendTo(context.player.opponent, context.player, "recovered", card, ".");
        }
    }
};
