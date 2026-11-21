import { AcceptanceReport } from "../../../AcceptanceReport.js";
import { GameEngine } from "../../engine/GameEngine.js";
import { Choice } from "../../state/Choice.js";
import { Interrupt, InterruptSync } from "../../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../../state/interrupts/InterruptResolution.js";
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

    public abstract applyAverage(context: AttackContext): void;

    protected generateInterrupt(context: AttackContext, prompt: string, choices: Choice[]): InterruptSync {
        return {
            player: context.attacker.owner.id,
            prompt: prompt,
            choices: choices.filter(c => !c.id || !context.targets.includes(c.id)).map(c => new Choice({ id: c.id, text: c.label }).withPriority(100)),
            resolution: InterruptResolution.AttackTargets,
            args: [ context.attack.name, ...context.targets ]
        };
    }
};
