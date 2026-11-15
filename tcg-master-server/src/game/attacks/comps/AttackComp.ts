import { AcceptanceReport } from "../../../AcceptanceReport.js";
import { GameEngine } from "../../engine/GameEngine.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { AttackContext } from "../AttackContext.js";

export abstract class AttackComp {
    protected readonly args?: any;

    public constructor(args?: any) {
        this.args = args;
    }

    public canUse(engine: GameEngine): AcceptanceReport {
        return AcceptanceReport.Accepted;
    }

    public validateTargets(context: AttackContext): Interrupt | null {
        return null;
    }

    public abstract apply(context: AttackContext): void;
};
