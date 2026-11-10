import { Attack } from "./Attack.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";

export type AttackContext = {
    engine: GameEngine,
    attack: Attack,
    attacker: PokemonCard,
    defender: PokemonCard,
    damage?: number
};

export abstract class AttackWorker {
    protected readonly args: any;

    public constructor(args?: any) {
        this.args = args;
    }

    public canUse(context: AttackContext): boolean {
        return true;
    }

    public validateTargets(context: AttackContext, ...targets: (number | string)[]): Interrupt | null {
        return null;
    }

    public preEffect(context: AttackContext, damage: number): number {
        return damage;
    }

    public postEffect(context: AttackContext, knockedOut: boolean, ...targets: (number | string)[]) { }
};
