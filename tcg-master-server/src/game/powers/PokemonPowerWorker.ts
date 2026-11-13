import { GameEngine } from "../engine/GameEngine.js";
import { Choice } from "../state/Choice.js";
import { Interrupt, InterruptSync } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { InterruptType } from "../state/interrupts/InterruptType.js";
import { Player } from "../state/Player.js";
import { PokemonCard } from "../state/PokemonCard.js";

export type PokemonPowerContext = {
    engine: GameEngine;
    owner: Player;
    card: PokemonCard;
    interruptType?: InterruptType;
    forceInterrupt?: boolean;
    args?: any;
};

export abstract class PokemonPowerWorker {
    private get targetsKey(): string {
        return this.constructor.name;
    }

    public getTargets(context: PokemonPowerContext): (number | string)[] {
        return context.args[this.targetsKey] ?? [];
    }

    public abstract execute(context: PokemonPowerContext, ...targets: (number | string)[]): void;

    public cantUseReason(context: PokemonPowerContext): string | null {
        return null;
    }

    public acquireTargets(context: PokemonPowerContext, ...targets: (number | string)[]): Interrupt | null {
        return null;
    }

    public consolidateTargets(context: PokemonPowerContext) {
        if (!context.args[this.targetsKey]) {
            context.args[this.targetsKey] = [];
        }
        const key = `${this.targetsKey}.next`;
        if (context.args[key]) {
            context.args[this.targetsKey].push(context.args[key]);
            context.args[key] = undefined;
        }
    }

    protected generateInterrupt(context: PokemonPowerContext, prompt: string, choices: Choice[]): InterruptSync {
        return {
            type: context.interruptType,
            player: context.owner.id,
            prompt: prompt,
            choices: choices,
            force: context.forceInterrupt,
            resolution: InterruptResolution.UsePokemonPower,
            args: [ context.card.id, `${this.targetsKey}.next` ],
            compoundArgs: context.args
        };
    }
};
