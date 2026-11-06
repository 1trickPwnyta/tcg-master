import { AttackContext } from "../cards/workers/AttackWorker.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";

export abstract class AttackWorker {
    public validateTargets(context: AttackContext, ...targets: number[]): Interrupt | null {
        return null;
    }

    public preEffect(context: AttackContext, damage: number): number {
        return damage;
    }

    public postEffect(context: AttackContext, knockedOut: boolean, ...targets: number[]) { }
};
