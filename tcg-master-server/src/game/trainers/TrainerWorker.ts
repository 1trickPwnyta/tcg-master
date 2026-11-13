import { Choice } from "../state/Choice.js";
import { Interrupt, InterruptSync } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { Location } from "../state/Location.js";
import { TrainerContext } from "../state/TrainerCard.js";

export abstract class TrainerWorker {
    private get targetsKey(): string {
        return this.constructor.name;
    }

    protected getTargetLocation(context: TrainerContext): Location {
        return context.player.hand;
    }

    public getTargets(context: TrainerContext): (number | string)[] {
        return context.args[this.targetsKey];
    }

    public validate(context: TrainerContext): boolean {
        return true;
    }

    public acquireTargets(context: TrainerContext, ...targets: (number | string)[]): Interrupt | null {
        return null;
    }

    public abstract execute(context: TrainerContext, ...targets: (number | string)[]): void;

    protected generateInterrupt(context: TrainerContext, prompt: string, choices: Choice[]): InterruptSync {
        return {
            type: context.interruptType,
            player: context.player.id,
            prompt: prompt,
            choices: choices,
            force: context.forceInterrupt,
            resolution: InterruptResolution.TrainerTargets,
            cancelResolution: InterruptResolution.CancelTrainer,
            args: [ context.card.id, `${this.targetsKey}.next` ],
            compoundArgs: context.args
        };
    }

    public consolidateTargets(context: TrainerContext) {
        if (!context.args[this.targetsKey]) {
            context.args[this.targetsKey] = [];
        }
        const key = `${this.targetsKey}.next`;
        if (context.args[key]) {
            context.args[this.targetsKey].push(context.args[key]);
            context.args[key] = undefined;
        }
        this.storeInLimbo(context, context.args[this.targetsKey]);
    }

    private storeInLimbo(context: TrainerContext, cards: number[]) {
        for (const id of cards) {
            const card = context.engine.search.getCard(id, this.getTargetLocation(context));
            if (card && card.location != card.owner.active && card.location != card.owner.bench) {
                context.player.limbo.add(card);
            }
        }
    }
};
