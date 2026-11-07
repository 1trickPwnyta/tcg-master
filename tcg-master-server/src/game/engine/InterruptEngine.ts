import { InterruptResolver } from "../state/interrupts/InterruptResolver.js";
import { Interrupt, InterruptSync } from "../state/interrupts/Interrupt.js";
import { SubEngine } from "./SubEngine.js";

export class InterruptEngine extends SubEngine {
    public interrupt(interrupt: Interrupt) {
        this.assignId(interrupt);
        this.state.interrupt = interrupt;
        this.game.sendInterrupt(interrupt);
    }

    public stack(interrupt: Interrupt) {
        if (this.state.interrupt) {
            this.state.interruptStack.push(this.state.interrupt);
        }
        this.interrupt(interrupt);
    }

    private assignId(interrupt: Interrupt) {
        if (!interrupt.id) {
            interrupt.id = this.state.nextInterrupt_id++;
        }
        if (interrupt.interrupts) {
            for (const sub of interrupt.interrupts) {
                this.assignId(sub);
            }
        }
    }

    public get(player_id: number, root?: Interrupt): InterruptSync | null {
        if (this.state.interrupt?.player === player_id) {
            return this.state.interrupt as InterruptSync;
        } else if (root?.player === player_id) {
            return root as InterruptSync;
        } else {
            const interrupts = (root ?? this.state.interrupt)?.interrupts;
            if (interrupts) {
                for (const interrupt of interrupts) {
                    if (this.get(player_id, interrupt)) {
                        return interrupt as InterruptSync;
                    }
                }
            }
        }
        return null;
    }

    private close(interrupt_id: number) {
        if (this.state.interrupt?.id === interrupt_id) {
            this.state.interrupt = null;
            return;
        }
        this.closeRecursive(interrupt_id, this.state.interrupt);
        this.clean(this.state.interrupt);
    }

    private closeRecursive(interrupt_id: number, root: Interrupt | null) {
        if (root?.interrupts) {
            for (let i = 0; i < root.interrupts.length; i++) {
                if (root.interrupts[i].id === interrupt_id) {
                    root.interrupts.splice(i, 1);
                    return;
                }
                this.closeRecursive(interrupt_id, root.interrupts[i]);
            }
        }
    }

    private clean(root: Interrupt | null) {
        if (this.state.interrupt?.interrupts && !this.state.interrupt.interrupts.length) {
            this.state.interrupt = null;
            return;
        }
        if (root?.interrupts) {
            for (let i = 0; i < root.interrupts.length; i++) {
                if (root.interrupts[i].interrupts && !root.interrupts[i].interrupts?.length) {
                    root.interrupts.splice(i, 1);
                }
                this.clean(root.interrupts[i]);
            }
        }
    }

    public resolve(player_id: number, choice: number | null) {
        const interrupt = this.get(player_id);
        if (interrupt) {
            let resolved = true;
            if (choice !== null) {
                resolved = InterruptResolver.resolve(this.game, interrupt, choice);
            } else if (interrupt.cancelResolution) {
                InterruptResolver.cancel(this.game, interrupt, player_id);
            }
            if (resolved) {
                this.close(interrupt.id!);
            }
            this.game.players.get(player_id).menus++;
            this.game.getClient(player_id).wait();
            this.game.update();
        } else {
            throw new Error(`No interrupt found for player ${player_id}.`)
        }
    }
};
