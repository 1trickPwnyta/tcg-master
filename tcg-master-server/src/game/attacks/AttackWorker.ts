import { Attack } from "../../defs/Attack.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonCard } from "../state/PokemonCard.js";

export type AttackContext = {
    engine: GameEngine,
    attack: Attack,
    attacker: PokemonCard,
    defender: PokemonCard
};

export abstract class AttackWorker {
    protected readonly args: any;

    public constructor(args?: any) {
        this.args = args;
    }

    public validateTargets(context: AttackContext, ...targets: number[]): Interrupt | null {
        return null;
    }

    public preEffect(context: AttackContext, damage: number): number {
        return damage;
    }

    public postEffect(context: AttackContext, knockedOut: boolean, ...targets: number[]) { }
};
