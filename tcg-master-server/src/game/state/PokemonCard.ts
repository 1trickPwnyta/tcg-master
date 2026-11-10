import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Card } from "./Card.js";
import { Choice } from "./Choice.js";
import { EnergyCard } from "./EnergyCard.js";
import { InterruptResolution } from "./interrupts/InterruptResolution.js";
import { Location } from "./Location.js";
import { Player } from "./Player.js";
import { Serializable, Serialize } from "./serializer.js";

export type DamageContext = {
    amount: number;
    attacker?: PokemonCard;
    source?: string;
    type?: EnergyTypeDef;
};

@Serializable()
export class PokemonCard extends Card {
    @Serialize()
    public damage: number = 0;

    @Serialize()
    public orientation: "normal" | "asleep" | "confused" | "paralyzed" = "normal";

    @Serialize()
    public readonly attachments: Location;

    @Serialize()
    public readonly statuses: { def: string, args: any }[] = [];

    public get fullTokens(): any[] {
        return [ this.owner, "'s", this ];
    }

    public override get targetName(): string {
        return [
            super.targetName,
            this.owner.activePokemon == this ? "(active)" : "",
            this.energy.length ? `[${this.energy.map(e => e.def.type.symbol).join("")}]` : ""
        ].filter(s => s.length).join(" ");
    }

    public get def(): PokemonCardDef {
        return super.def as PokemonCardDef;
    }

    public get energy(): EnergyCard[] {
        return this.attachments.cards.filter(c => c.def.kind === "energy").map(c => c as EnergyCard);
    }

    public get status(): { def: StatusDef, args: any }[] {
        return this.statuses.map(s => ({ def: DefDatabase.get<StatusDef>(s.def), args: s.args }));
    }

    public get weakness(): EnergyTypeDef | undefined {
        let weakness = this.def.weakness;
        for (const status of this.status) {
            weakness = status.def.worker.getModifiedWeakness({
                engine: this.engine,
                owner: this.owner,
                card: this
            }, status.args);
        }
        return weakness;
    }

    public get resistance(): EnergyTypeDef | undefined {
        let resistance = this.def.resistance;
        for (const status of this.status) {
            resistance = status.def.worker.getModifiedResistance({
                engine: this.engine,
                owner: this.owner,
                card: this
            }, status.args);
        }
        return resistance;
    }

    public constructor(id: number, engine: GameEngine, def: PokemonCardDef, owner: Player) {
        super(id, engine, def, owner);
        this.attachments = new Location(this.id * 100000, this.engine, owner);
    }

    public override play(): boolean {
        if (this.def.stage === "basic") {
            if (this.owner.bench.full) {
                this.engine.sendError(this.owner, "Your bench is full.");
                return false;
            } else {
                this.owner.bench.add(this);
                this.engine.send(this.owner, "placed", this, "on", this.owner.pronouns.possessive, "bench.");
                return true;
            }
        } else {
            const cards = this.owner.pokemonInPlay.filter(c => c.def.evolution?.evolvesDirect(this.name));
            if (cards.length) {
                this.engine.interrupts.interrupt({
                    player: this.owner.id,
                    prompt: `Which Pokémon will evolve into ${this.name}?`,
                    choices: cards.map(c => new Choice(c)),
                    resolution: InterruptResolution.Evolve,
                    args: [ this.id ]
                });
                return true;
            } else {
                this.engine.sendError(this.owner, "None of your Pokémon can evolve into", this, ".");
                return false;
            }
        }
    }

    public cantAttackReason(): string | null {
        for (const status of this.status) {
            if (!status.def.canAttack) {
                return status.def.label;
            }
        }

        return null;
    }

    public cantRetreatReason(): string | null {
        for (const status of this.status) {
            if (!status.def.canRetreat) {
                return status.def.label;
            }
        }

        return null;
    }

    public dealDamage(context: DamageContext): boolean {
        let amount = context.amount;

        if (context.type) {
            if (this.weakness === context.type) {
                amount *= 2;
            }
            if (this.resistance === context.type) {
                amount -= 30;
                amount = Math.max(0, amount);
            }
        }

        for (const status of this.status) {
            amount = status.def.worker.modifyDamageTaken({
                engine: this.engine,
                owner: this.owner,
                card: this
            }, amount, status.args);
        }

        if (amount > 0) {
            this.damage += amount;
            this.engine.send(...this.fullTokens, "took", { name: amount.toString(), type: "damage" }, `damage${context.source ? ` due to ${context.source}` : ""}!`);
            if (this.damage >= this.def.hp) {
                this.knockOut(context.attacker);
                return true;
            }
        }

        return false;
    }

    public knockOut(attacker?: PokemonCard) {
        this.engine.send(...this.fullTokens, "was knocked out!");
        for (const status of this.status) {
            status.def.worker.notify_knockedOut({
                engine: this.engine,
                owner: this.owner,
                card: this
            }, attacker);
        }
        this.owner.discard.add(this);
        this.owner.opponent.takePrize();
        const interrupt = this.engine.turns.checkActivePokemon();
        if (interrupt) {
            this.engine.interrupts.interrupt(interrupt);
        }
    }

    public heal(amount: number) {
        amount = Math.min(amount, this.damage);
        if (amount) {
            this.damage -= amount;
            this.engine.send(...this.fullTokens, "was healed for ", { name: amount.toString(), type: "heal" }, "HP.");
        }
    }

    public hasStatus(def: StatusDef): boolean {
        return this.statuses.some(s => s.def === def.name);
    }

    public giveStatus(def: StatusDef, args?: any) {
        this.statuses.push({ def: def.name, args: args });
        this.orientation = def.orientation ?? this.orientation;
        def.worker.notify_given({
            engine: this.engine,
            owner: this.owner,
            card: this
        }, args);
    }

    public removeStatus(def: StatusDef) {
        const status = this.statuses.find(s => s.def === def.name)!;
        this.statuses.splice(this.statuses.indexOf(status), 1);
        if (def.orientation) {
            this.orientation = "normal";
        }
    }

    public clearStatus() {
        const removable = this.statuses.filter(s => !DefDatabase.get<StatusDef>(s.def).permanent);
        for (const status of removable) {
            this.statuses.splice(this.statuses.indexOf(status), 1);
        }
    }

    public poison() {
        this.giveStatus(StatusDefOf.Poison);
    }

    public confuse() {
        this.giveStatus(StatusDefOf.Confusion);
    }

    public paralyze() {
        this.giveStatus(StatusDefOf.Paralysis);
    }

    public sleep() {
        this.giveStatus(StatusDefOf.Sleep);
    }
};
