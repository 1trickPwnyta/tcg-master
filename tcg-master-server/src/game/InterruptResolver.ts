import { Game } from "./Game.js";
import { InterruptResolution } from "./InterruptResolution.js";
import { InterruptSync } from "./state/Interrupt.js";
import { StateWorker } from "./state/workers/StateWorker.js";
import { StateWorker_MoveCard } from "./state/workers/StateWorker_MoveCard.js";

export class InterruptResolver {
    private static readonly workers: Map<InterruptResolution, StateWorker> = new Map<InterruptResolution, StateWorker>();

    static {
        InterruptResolver.workers.set(InterruptResolution.MoveCard, new StateWorker_MoveCard());
    }

    public static resolve(game: Game, interrupt: InterruptSync, choice: number) {
        const key = interrupt.resolution!;
        const worker = InterruptResolver.workers.get(key);
        if (worker) {
            const target = interrupt.choices[choice].target_id;
            worker.execute(game.getState(), target, ...(interrupt.args ?? []));
        } else {
            throw new Error(`No worker for ${key}.`);
        }
    }
}