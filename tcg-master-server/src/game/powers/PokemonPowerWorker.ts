import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Choice } from "../state/interrupts/Choice.js";
import { Interrupt, InterruptSync } from "../state/interrupts/Interrupt.js";
import { InterruptResolution } from "../state/interrupts/InterruptResolution.js";
import { Player } from "../state/Player.js";
import { PokemonCard } from "../state/PokemonCard.js";

export type PokemonPowerContext = {
    engine: GameEngine;
    owner: Player;
    card: PokemonCard;
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

    protected hasDisqualifyingStatus(user: PokemonCard): boolean {
        return user.hasStatus(StatusDefOf.Sleep) || user.hasStatus(StatusDefOf.Confusion) || user.hasStatus(StatusDefOf.Paralysis);
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

    protected generateInterrupt(context: PokemonPowerContext): InterruptSync {
        return new InterruptSync(context.owner)
            .withResolution(InterruptResolution.UsePokemonPower)
            .withArgs(context.card.id, `${this.targetsKey}.next`)
            .withCompoundArgs(context.args);
    }
};
