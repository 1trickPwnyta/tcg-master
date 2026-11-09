import { PlayContext } from "../cards/workers/CardWorker.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";

export abstract class TrainerWorker {
    public selectTargets(context: PlayContext): Interrupt | "fail" | null {
        return null;
    }

    public abstract execute(context: PlayContext, ...targets: number[]): void;
};
