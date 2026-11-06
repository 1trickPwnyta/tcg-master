import { PlayContext } from "../cards/workers/CardWorker.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";

export abstract class TrainerWorker {
    public validateTargets(context: PlayContext, ...targets: number[]): Interrupt | "fail" | null {
        return null;
    }

    public abstract execute(context: PlayContext, ...targets: number[]): void;
};
