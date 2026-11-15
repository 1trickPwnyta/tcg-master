import { DefDatabase } from "../../defs/DefDatabase.js";
import { EffectDef } from "../../defs/EffectDef.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { EffectContext } from "../effects/EffectWorker.js";
import { GameEngine } from "../engine/GameEngine.js";
import { PokemonCard } from "../state/PokemonCard.js";
import { Serializable, Serialize } from "../state/serializer.js";

@Serializable()
export class StatusContext {
    @Serialize()
    public readonly def_name: string;

    @Serialize()
    public readonly args?: any;

    public get def(): StatusDef {
        return DefDatabase.get<StatusDef>(this.def_name);
    }

    public constructor(def: StatusDef, args?: any) {
        this.def_name = def.name;
        this.args = args;
    }
};

export type AttackResult = {
    attacker: number;
    defender: number;
    damage: number;
    status: StatusContext[];
};

export class AttackContext {
    public readonly engine: GameEngine;
    public damage_attacker: number = 0;
    public damage_defender: number;
    private _finalDamage?: number;
    private readonly status_attacker: StatusContext[] = [];
    private readonly status_defender: StatusContext[] = [];
    private readonly effects: EffectContext[] = [];
    private _failed: boolean = false;
    private targets?: (number | string)[];

    public readonly attacker: PokemonCard;
    public readonly defender: PokemonCard;

    public get failed(): boolean {
        return this._failed;
    }

    public get finalDamage(): number {
        return this._finalDamage ?? 0;
    }

    public constructor(engine: GameEngine, damage: number, ...targets: (number | string)[]) {
        this.engine = engine;
        this.damage_defender = damage;
        this.targets = targets;
        this.attacker = engine.game.activePokemon;
        this.defender = engine.game.defendingPokemon;
    }

    public fail() {
        this._failed = true;
    }

    public addAttackerStatus(def: StatusDef, args?: any) {
        this.status_attacker.push(new StatusContext(def, args));
    }

    public addDefenderStatus(def: StatusDef, args?: any) {
        this.status_defender.push(new StatusContext(def, args));
    }

    public addEffect(effect: EffectDef, args?: any) {
        this.effects.push({ def: effect, args: args });
    }

    public nextTarget(): number | string | null {
        if (this.targets!.length) {
            return this.targets!.splice(0, 1)[0];
        } else {
            return null;
        }
    }

    public resolve(): AttackResult {

        // Defender damage ///////////////////////
        const damageContext = {
            amount: this.damage_defender,
            attacker: this.attacker,
            source: "attack",
            type: this.attacker.def.type
        };
        let affected = true;
        for (const modifier of this.attacker.modifiers) {
            damageContext.amount = modifier.modifier.modifyDamageDealt({
                engine: this.engine,
                owner: this.attacker.owner,
                card: this.attacker
            }, damageContext, modifier.args);
        }
        for (const modifier of this.defender.modifiers) {
            if (!modifier.modifier.isAffectedByAttacks({
                engine: this.engine,
                owner: this.defender.owner,
                card: this.defender
            })) {
                damageContext.amount = 0;
                affected = false;
                break;
            }
        }
        const { knockedOut, finalDamage } = this.defender.dealDamage(damageContext);
        this._finalDamage = finalDamage;

        // Attacker status ///////////////////////
        for (const status of this.status_attacker) {
            this.attacker.giveStatus(status.def, status.args);
        }

        // Defender status ///////////////////////
        const finalStatus = [];
        if (affected) {
            for (const status of this.status_defender) {
                if (!knockedOut) {
                    this.defender.giveStatus(status.def, status.args);
                }
                finalStatus.push(status);
            }
        }

        // Effects ///////////////////////
        for (const effect of this.effects) {
            if (affected || effect.def.worker.getTarget(this) !== this.defender) {
                effect.def.worker.apply(this, effect.args);
            }
        }

        // Attacker damage/heal ///////////////////////
        if (this.damage_attacker < 0) {
            this.attacker.heal(-this.damage_attacker);
        } else if (this.damage_attacker > 0) {
            this.attacker.dealDamage({
                amount: this.damage_attacker,
                attacker: this.attacker,
                source: "attack",
                type: this.attacker.def.type
            });
        }

        return {
            attacker: this.attacker.id,
            defender: this.defender.id,
            damage: finalDamage,
            status: finalStatus
        };
    }
};
