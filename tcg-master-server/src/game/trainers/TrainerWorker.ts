import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/Choice.js";
import { Interrupt, InterruptSync } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { TrainerContext } from "./TrainerContext.js";

export abstract class TrainerWorker {
    protected getValidChoices(context: TrainerContext, possibleChoices: Choice[]): Choice[] {
        return possibleChoices.filter(c => !c.id || (c.id !== context.card.id && !context.targets.includes(c.id)));
    }

    public validate(context: TrainerContext): AcceptanceReport {
        return AcceptanceReport.Accepted;
    }

    public acquireTargets(context: TrainerContext): Interrupt | null {
        return null;
    }

    public abstract execute(context: TrainerContext): void;

    protected generateInterrupt(context: TrainerContext, prompt: string, choices: Choice[]): InterruptSync {
        return {
            type: context.interruptType,
            player: context.player.id,
            prompt: prompt,
            choices: choices,
            force: context.forceInterrupt,
            resolution: InterruptResolution.TrainerTargets,
            cancelResolution: InterruptResolution.CancelTrainer,
            args: [ context.card.id, ...context.targets ]
        };
    }
};
