import { InterruptResolver } from "../state/interrupts/InterruptResolver.js";
import { Interrupt, InterruptAsync, InterruptSync } from "../state/interrupts/Interrupt.js";
import { SubEngine } from "./SubEngine.js";

export class InterruptEngine extends SubEngine {
    public interrupt(interrupt: Interrupt) {
        if (this.state.interrupt && this.state.interrupt.id != interrupt.id) {
            this.state.interruptQueue.push(interrupt);
        } else {
            this.state.interrupt = interrupt;
            this.engine.sendInterrupt(interrupt);
        }
    }

    public get(player_id: number): InterruptSync | null {
        return this.state.interrupt?.getInterruptFor(player_id) ?? null;
    }

    private close(interrupt_id: number) {
        if (this.state.interrupt?.id === interrupt_id) {
            this.state.interrupt = null;
            return;
        } else if (this.state.interrupt instanceof InterruptAsync) {
            this.state.interrupt.close(interrupt_id);
            if (!this.state.interrupt.interrupts.length) {
                this.state.interrupt = null;
            }
        }
    }

    public resolve(player_id: number, choice: number | null) {
        const interrupt = this.get(player_id);
        if (interrupt) {
            let resolved = true;
            if (choice !== null) {
                resolved = InterruptResolver.resolve(this.engine, interrupt, choice);
            } else if (interrupt.cancelResolution) {
                InterruptResolver.cancel(this.engine, interrupt, player_id);
            }
            if (resolved) {
                this.close(interrupt.id!);
            }
            this.engine.game.getPlayer(player_id).menus++;
            this.engine.getClient(player_id)?.wait();
            this.engine.game.update();
        } else {
            throw new Error(`No interrupt found for player ${player_id}.`)
        }
    }
};
