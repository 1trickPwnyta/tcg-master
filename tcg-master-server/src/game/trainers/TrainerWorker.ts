import { Interrupt } from "../state/interrupts/Interrupt.js";
import { TrainerContext } from "../state/TrainerCard.js";

export abstract class TrainerWorker {
    public validateTargets(context: TrainerContext, ...targets: number[]): Interrupt | "fail" | null {
        return null;
    }

    public abstract execute(context: TrainerContext, ...targets: number[]): void;
};
