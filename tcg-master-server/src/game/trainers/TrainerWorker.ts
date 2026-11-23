import { AcceptanceReport } from "../../AcceptanceReport.js";
import { Choice } from "../state/interrupts/Choice.js";
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

    protected generateInterrupt(context: TrainerContext): InterruptSync {
        return new InterruptSync(context.player)
            .withResolution(InterruptResolution.TrainerTargets)
            .withCancelResolution(InterruptResolution.CancelTrainer)
            .withArgs(context.card.id, ...context.targets);
    }
};
