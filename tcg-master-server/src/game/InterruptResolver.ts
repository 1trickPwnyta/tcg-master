import { GameEngine } from "./engine/GameEngine.js";
import { InterruptResolution } from "./InterruptResolution.js";
import { InterruptSync } from "./state/Interrupt.js";
import { StateWorker } from "./state/workers/StateWorker.js";

const workers = new Map<InterruptResolution, StateWorker>();
export function ResolvesInterrupt(resolution: InterruptResolution) {
    return (worker: new () => StateWorker) => {
        workers.set(resolution, new worker());
    };
};

export class InterruptResolver {
    public static resolve(game: GameEngine, interrupt: InterruptSync, choice: number): boolean {
        const key = interrupt.choices[choice].resolution ?? interrupt.resolution!;
        const worker = workers.get(key);
        if (worker) {
            const target = interrupt.choices[choice].target_id;
            return worker.execute({ game: game, state: game.getState() }, target ?? null, ...(interrupt.choices[choice].args ?? interrupt.args ?? []));
        } else {
            throw new Error(`No worker for ${key}.`);
        }
    }

    public static cancel(game: GameEngine, interrupt: InterruptSync, player_id: string) {
        const key = interrupt.cancelResolution!;
        const worker = workers.get(key);
        if (worker) {
            worker.execute({ game: game, state: game.getState() }, player_id);
        } else {
            throw new Error(`No worker for ${key}.`);
        }
    }
};
