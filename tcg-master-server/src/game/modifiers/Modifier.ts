import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { AttackContext } from "../attacks/AttackWorker.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Player } from "../state/Player.js";
import { DamageContext, PokemonCard } from "../state/PokemonCard.js";

export type ModifierContext = {
    engine: GameEngine;
    owner: Player;
    card: PokemonCard;
};

export abstract class Modifier {
    public abstract get label(): string;
    public abstract get canAttack(): boolean;
    public abstract get canRetreat(): boolean;

    public get argsKey(): string {
        return this.constructor.name;
    }

    public get isEnergy(): boolean {
        return false;
    }

    public try_attack(context: ModifierContext, attackContext: AttackContext): boolean {
        return true;
    }

    public try_retreat(context: ModifierContext): boolean {
        return true;
    }

    public canUseAttack(context: ModifierContext, attackName: string, args: any): boolean {
        return true;
    }

    public provideEnergy(context: ModifierContext, args: any): EnergyTypeDef[] {
        return [];
    }

    public modifyDamageDealt(context: ModifierContext, damageContext: DamageContext, args: any): number {
        return damageContext.amount;
    }

    public modifyDamageTaken(context: ModifierContext, damageContext: DamageContext, args: any): number {
        return damageContext.amount;
    }

    public getModifiedWeakness(context: ModifierContext, args: any): EnergyTypeDef | undefined {
        return context.card.def.weakness;
    }

    public getModifiedResistance(context: ModifierContext, args: any): EnergyTypeDef | undefined {
        return context.card.def.resistance;
    }

    public notify_given(context: ModifierContext, args: any) { }

    public notify_removed(context: ModifierContext, args: any) { }

    public notify_knockedOut(context: ModifierContext, attacker?: PokemonCard) { }

    public notify_endOfTurn(context: ModifierContext, turn_id: number) { }

    protected abstract remove(context: ModifierContext): void;
};
