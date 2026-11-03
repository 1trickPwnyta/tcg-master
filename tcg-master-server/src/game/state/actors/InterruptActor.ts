import { InterruptResolver } from "../../InterruptResolver.js";
import { Interrupt, InterruptSync } from "../Interrupt.js";
import { StateActor } from "./StateActor.js";

export class InterruptActor extends StateActor {
    public interrupt(interrupt: Interrupt) {
        this.assignInterruptId(interrupt);
        this.state.interrupt = interrupt;
        this.game.sendInterrupt(interrupt);
    }

    public stackInterrupt(interrupt: Interrupt) {
        if (this.state.interrupt) {
            this.state.interruptStack.push(this.state.interrupt);
        }
        this.interrupt(interrupt);
    }

    private assignInterruptId(interrupt: Interrupt) {
        if (!interrupt.id) {
            interrupt.id = this.state.nextInterrupt_id++;
        }
        if (interrupt.interrupts) {
            for (const sub of interrupt.interrupts) {
                this.assignInterruptId(sub);
            }
        }
    }

    public getInterrupt(player_id: number, root?: Interrupt): InterruptSync | null {
        if (this.state.interrupt?.player === player_id) {
            return this.state.interrupt as InterruptSync;
        } else if (root?.player === player_id) {
            return root as InterruptSync;
        } else {
            const interrupts = (root ?? this.state.interrupt)?.interrupts;
            if (interrupts) {
                for (const interrupt of interrupts) {
                    if (this.getInterrupt(player_id, interrupt)) {
                        return interrupt as InterruptSync;
                    }
                }
            }
        }
        return null;
    }

    private closeInterrupt(interrupt_id: number) {
        if (this.state.interrupt?.id === interrupt_id) {
            this.state.interrupt = null;
            return;
        }
        this.closeInterruptRecursive(interrupt_id, this.state.interrupt);
        this.cleanInterrupts(this.state.interrupt);
    }

    private closeInterruptRecursive(interrupt_id: number, root: Interrupt | null) {
        if (root?.interrupts) {
            for (let i = 0; i < root.interrupts.length; i++) {
                if (root.interrupts[i].id === interrupt_id) {
                    root.interrupts.splice(i, 1);
                    return;
                }
                this.closeInterruptRecursive(interrupt_id, root.interrupts[i]);
            }
        }
    }

    private cleanInterrupts(root: Interrupt | null) {
        if (this.state.interrupt?.interrupts && !this.state.interrupt.interrupts.length) {
            this.state.interrupt = null;
            return;
        }
        if (root?.interrupts) {
            for (let i = 0; i < root.interrupts.length; i++) {
                if (root.interrupts[i].interrupts && !root.interrupts[i].interrupts?.length) {
                    root.interrupts.splice(i, 1);
                }
                this.cleanInterrupts(root.interrupts[i]);
            }
        }
    }

    public resolveInterrupt(player_id: number, choice: number | null) {
        const interrupt = this.getInterrupt(player_id);
        if (interrupt) {
            let resolved = true;
            if (choice !== null) {
                resolved = InterruptResolver.resolve(this.game, interrupt, choice);
            } else if (interrupt.cancelResolution) {
                InterruptResolver.cancel(this.game, interrupt, player_id);
            }
            if (resolved) {
                this.closeInterrupt(interrupt.id!);
            }
            this.game.getClient(player_id).wait();
            this.game.update();
        } else {
            throw new Error(`No interrupt found for player ${player_id}.`)
        }
    }
};
