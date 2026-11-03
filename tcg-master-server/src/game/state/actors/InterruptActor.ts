import { GameEngine } from "../../engine/GameEngine.js";
import { InterruptResolver } from "../../InterruptResolver.js";
import { GameState } from "../GameState.js";
import { Interrupt, InterruptSync } from "../Interrupt.js";

export class InterruptActor {
    public static getInterrupt(state: GameState, player_id: number, root?: Interrupt): InterruptSync | null {
        if (state.interrupt?.player === player_id) {
            return state.interrupt as InterruptSync;
        } else if (root?.player === player_id) {
            return root as InterruptSync;
        } else {
            const interrupts = (root ?? state.interrupt)?.interrupts;
            if (interrupts) {
                for (const interrupt of interrupts) {
                    if (InterruptActor.getInterrupt(state, player_id, interrupt)) {
                        return interrupt as InterruptSync;
                    }
                }
            }
        }
        return null;
    }

    private static closeInterrupt(state: GameState, interrupt_id: number) {
        if (state.interrupt?.id === interrupt_id) {
            state.interrupt = null;
            return;
        }
        InterruptActor.closeInterruptRecursive(state, interrupt_id, state.interrupt);
        InterruptActor.cleanInterrupts(state, state.interrupt);
    }

    private static closeInterruptRecursive(state: GameState, interrupt_id: number, root: Interrupt | null) {
        if (root?.interrupts) {
            for (let i = 0; i < root.interrupts.length; i++) {
                if (root.interrupts[i].id === interrupt_id) {
                    root.interrupts.splice(i, 1);
                    return;
                }
                InterruptActor.closeInterruptRecursive(state, interrupt_id, root.interrupts[i]);
            }
        }
    }

    private static cleanInterrupts(state: GameState, root: Interrupt | null) {
        if (state.interrupt?.interrupts && !state.interrupt.interrupts.length) {
            state.interrupt = null;
            return;
        }
        if (root?.interrupts) {
            for (let i = 0; i < root.interrupts.length; i++) {
                if (root.interrupts[i].interrupts && !root.interrupts[i].interrupts?.length) {
                    root.interrupts.splice(i, 1);
                }
                InterruptActor.cleanInterrupts(state, root.interrupts[i]);
            }
        }
    }

    public static resolveInterrupt(game: GameEngine, state: GameState, player_id: number, choice: number | null) {
        const interrupt = InterruptActor.getInterrupt(state, player_id);
        if (interrupt) {
            let resolved = true;
            if (choice !== null) {
                resolved = InterruptResolver.resolve(game, interrupt, choice);
            } else if (interrupt.cancelResolution) {
                InterruptResolver.cancel(game, interrupt, player_id);
            }
            if (resolved) {
                InterruptActor.closeInterrupt(state, interrupt.id!);
            }
            game.getClient(player_id).wait();
            game.update();
        } else {
            throw new Error(`No interrupt found for player ${player_id}.`)
        }
    }
};
