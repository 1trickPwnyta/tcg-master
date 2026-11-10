import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { AttackContext } from "../attacks/AttackWorker.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Player } from "../state/Player.js";
import { DamageContext, PokemonCard } from "../state/PokemonCard.js";

export type StatusContext = {
    engine: GameEngine;
    owner: Player;
    card: PokemonCard;
};

export abstract class StatusWorker {
    private def: StatusDef;

    public constructor(def: StatusDef, args: any) {
        this.def = def;
    }

    public try_attack(context: StatusContext, attackContext: AttackContext): boolean {
        return true;
    }

    public try_retreat(context: StatusContext): boolean {
        return true;
    }

    public canUseAttack(context: StatusContext, attackName: string, args: any): boolean {
        return true;
    }

    public modifyDamageDealt(context: StatusContext, amount: number, args: any): number {
        return amount;
    }

    public modifyDamageTaken(context: StatusContext, amount: number, args: any): number {
        return amount;
    }

    public getModifiedWeakness(context: StatusContext, args: any): EnergyTypeDef | undefined {
        return context.card.def.weakness;
    }

    public getModifiedResistance(context: StatusContext, args: any): EnergyTypeDef | undefined {
        return context.card.def.resistance;
    }

    public notify_given(context: StatusContext, args: any) { }

    public notify_knockedOut(context: StatusContext, attacker?: PokemonCard) { }

    public notify_endOfTurn(context: StatusContext, turn_id: number) { }

    protected remove(context: StatusContext) {
        context.card.removeStatus(this.def);
    }
};
