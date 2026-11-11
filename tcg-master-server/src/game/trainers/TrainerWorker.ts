import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "../state/TrainerCard.js";

export abstract class TrainerWorker {
    public preTarget(context: TrainerContext): true | "fail" {
        return true;
    }

    public validateTargets(context: TrainerContext, ...targets: number[]): Interrupt | "fail" | null {
        return null;
    }

    public abstract execute(context: TrainerContext, ...targets: number[]): void;

    protected storeInLimbo(context: TrainerContext, ...cards: number[]) {
        for (const id of cards) {
            const card = context.engine.search.getCard(id, context.targetsLocation ?? context.player.hand);
            if (card) {
                context.player.limbo.add(card);
            }
        }
    }
};
