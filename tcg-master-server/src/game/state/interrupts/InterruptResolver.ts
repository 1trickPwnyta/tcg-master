import { GameEngine } from "../../engine/GameEngine.js";
import { InterruptResolution } from "./InterruptResolution.js";
import { InterruptSync } from "./Interrupt.js";
import { InterruptWorker } from "./workers/InterruptWorker.js";

const workers = new Map<InterruptResolution, InterruptWorker>();
export function ResolvesInterrupt(resolution: InterruptResolution) {
    return (worker: new () => InterruptWorker) => {
        workers.set(resolution, new worker());
    };
};

export class InterruptResolver {
    public static resolve(engine: GameEngine, interrupt: InterruptSync, choice: number): boolean {
        const key = interrupt.choices[choice].resolution ?? interrupt.resolution!;
        const worker = workers.get(key);
        if (worker) {
            const target = interrupt.choices[choice].target_id;
            return worker.execute({ engine: engine }, target ?? null, ...(interrupt.choices[choice].args ?? interrupt.args ?? []));
        } else {
            throw new Error(`No worker for ${key}.`);
        }
    }

    public static cancel(engine: GameEngine, interrupt: InterruptSync, player_id: number) {
        const key = interrupt.cancelResolution!;
        const worker = workers.get(key);
        if (worker) {
            worker.execute({ engine: engine }, player_id, ...(interrupt.args ?? []));
        } else {
            throw new Error(`No worker for ${key}.`);
        }
    }
};
