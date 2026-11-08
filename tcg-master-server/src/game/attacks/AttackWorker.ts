import { Attack } from "../../defs/Attack.js";
import { GameEngine } from "../engine/GameEngine.js";
import { CardState } from "../state/CardState.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";

export type AttackContext = {
    engine: GameEngine,
    attack: Attack,
    attacker: CardState,
    defender: CardState
};

export abstract class AttackWorker {
    public validateTargets(context: AttackContext, ...targets: number[]): Interrupt | null {
        return null;
    }

    public preEffect(context: AttackContext, damage: number): number {
        return damage;
    }

    public postEffect(context: AttackContext, knockedOut: boolean, ...targets: number[]) { }
};
