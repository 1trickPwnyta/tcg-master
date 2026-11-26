import { parentPort } from "worker_threads";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { StatusDefOf } from "../../defs/defof/StatusDefOf.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { PokemonCardDef } from "../../defs/PokemonCardDef.js";
import { StatusDef } from "../../defs/StatusDef.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Modifier } from "../modifiers/Modifier.js";
import { Attachments } from "./Attachments.js";
import { Card } from "./Card.js";
import { Choice } from "./interrupts/Choice.js";
import { InterruptResolution } from "./interrupts/InterruptResolution.js";
import { Location } from "./Location.js";
import { Player } from "./Player.js";
import { ClientSerialize, ClientSerializeProxy, Serializable, Serialize } from "./serializer.js";
import { IToken } from "../../IToken.js";
import { InterruptSync } from "./interrupts/Interrupt.js";
import { ClientEventType } from "../../Client.js";

export type DamageContext = {
    amount: number;
    attacker?: PokemonCard;
    source?: "attack" | string;
    type?: EnergyTypeDef;
};

@Serializable()
export class PokemonCard extends Card {
    @Serialize() @ClientSerialize()
    public damage: number = 0;

    @Serialize() @ClientSerialize()
    public orientation: "normal" | "asleep" | "confused" | "paralyzed" = "normal";

    @Serialize() @ClientSerialize()
    public readonly attachments: Attachments;

    @Serialize() @ClientSerialize()
    public readonly statuses: { def: string, args: any }[] = [];

    @Serialize()
    public evolutionEligible: boolean = false;

    public get fullTokens(): any[] {
        return [ this.owner, "'s", this ];
    }

    public override get targetName(): IToken[] {
        return [
            this.token,
            { name: this.owner.activePokemon == this ? "(active)" : "" },
            { name: this.attachments.energyString }
        ].filter(s => s.name.length);
    }

    public get def(): PokemonCardDef {
        return super.def as PokemonCardDef;
    }

    public get inPlay(): boolean {
        return this.location == this.owner.active || this.location == this.owner.bench;
    }

    public get energy(): EnergyTypeDef[] {
        return this.attachments.energy;
    }

    public get remainingHealth(): number {
        return this.def.hp - this.damage;
    }

    public get modifiers(): { modifier: Modifier, args: any }[] {
        return [
            ...this.statuses.map(s => ({ modifier: DefDatabase.get<StatusDef>(s.def).modifier, args: s.args })),
            ...this.attachments.cards.filter(a => a.def.modifiers.length).flatMap(a => a.def.modifiers).map(m => ({
                modifier: m, args: {}
            })),
            ...(this.def.power ? this.def.power.modifiers.map(m => ({ modifier: m, args: {} })) : [])
        ];
    }

    public get weakness(): EnergyTypeDef | undefined {
        let weakness = this.def.weakness;
        for (const status of this.modifiers) {
            weakness = status.modifier.getModifiedWeakness({
                engine: this.engine,
                owner: this.owner,
                card: this
            }, status.args);
        }
        return weakness;
    }

    public get resistance(): EnergyTypeDef | undefined {
        let resistance = this.def.resistance;
        for (const status of this.modifiers) {
            resistance = status.modifier.getModifiedResistance({
                engine: this.engine,
                owner: this.owner,
                card: this
            }, status.args);
        }
        return resistance;
    }

    public override get hasher(): any {
        return [
            super.hasher,
            this.damage,
            this.orientation,
            this.attachments.cards.map(a => a.hasher),
            this.statuses
        ];
    }

    public constructor(id: number, engine: GameEngine, def: PokemonCardDef, owner: Player) {
        super(id, engine, def, owner);
        this.attachments = new Attachments(this.id * 100000, this.engine, owner, this);
    }

    public override play(): boolean {
        if (this.def.stage === "basic") {
            if (this.owner.bench.full) {
                this.engine.sendError(this.owner, "Your bench is full.");
                return false;
            } else {
                this.owner.bench.add(this);
                this.engine.showcase(this);
                this.engine.send(this.owner, "placed", this, "on", this.owner.pronouns.possessive, "bench.");
                return true;
            }
        } else {
            const cards = this.owner.pokemonInPlay.filter(c => c.evolutionEligible && c.def.evolution?.evolvesDirect(this.name));
            if (cards.length) {
                this.engine.interrupts.interrupt(new InterruptSync(this.owner)
                    .withPrompt("Which Pokémon will evolve into", this, "?")
                    .withChoices(cards.map(c => new Choice(c)))
                    .withResolution(InterruptResolution.Evolve)
                    .withArgs(this.id));
                return true;
            } else {
                this.engine.sendError(this.owner, `None of your Pokémon can evolve into ${this.name}.`);
                return false;
            }
        }
    }

    public evolve(evolution: PokemonCard) {
        this.location!.add(evolution);
        evolution.damage = this.damage;
        this.attachments.transfer(evolution.attachments);
        evolution.attachments.add(this);
        this.engine.showcase(evolution);
        this.engine.send(...this.fullTokens, "evolved into", evolution, "!");
    }

    public devolve(prevolution: PokemonCard) {
        this.location!.add(prevolution);
        if (prevolution.def.stage === "basic") {
            const higher = this.attachments.cards.find(c => c instanceof PokemonCard && c.def.stage === "stage1");
            higher?.discard();
        }
        this.attachments.transfer(prevolution.attachments);
        prevolution.damage = this.damage;
        this.discard();
        this.engine.send(...this.fullTokens, "devolved into", prevolution, "!");
    }

    public cantAttackReason(): string | null {
        for (const status of this.modifiers) {
            if (!status.modifier.canAttack) {
                return status.modifier.label;
            }
        }

        return null;
    }

    public cantRetreatReason(): string | null {
        for (const status of this.modifiers) {
            if (!status.modifier.canRetreat) {
                return status.modifier.label;
            }
        }

        return null;
    }

    @ClientSerializeProxy()
    public proxy(player_id: number): any {
        if (!this.engine.game.started && player_id !== this.owner_id) {
            return { id: this.id, name: "Face-down card", graphicPath: "back.png", damage: 0, attachments: { cards: [] } };
        } else {
            return undefined;
        }
    }

    public dealDamage(context: DamageContext): { knockedOut: boolean, finalDamage: number } {
        if (context.type) {
            if (this.weakness === context.type) {
                context.amount *= 2;
            }
            if (this.resistance === context.type) {
                context.amount -= 30;
                context.amount = Math.max(0, context.amount);
            }
        }

        for (const status of this.modifiers) {
            context.amount = status.modifier.modifyDamageTaken({
                engine: this.engine,
                owner: this.owner,
                card: this
            }, context, status.args);
        }

        if (context.amount > 0) {
            this.damage += context.amount;
            this.engine.sendEvent({
                type: ClientEventType.Damage,
                args: {
                    receiver: this.id,
                    amount: context.amount
                }},
                ...this.fullTokens, "took", {
                    name: context.amount.toString(),
                    type: "damage"
                }, `damage${context.source && context.source !== "attack" ? ` due to ${context.source}` : ""}!`
            );

            for (const status of this.modifiers) {
                status.modifier.notify_damageTaken({
                    engine: this.engine,
                    owner: this.owner,
                    card: this
                }, context);
            }

            if (this.damage >= this.def.hp) {
                this.knockOut(context.attacker);
                return { knockedOut: true, finalDamage: context.amount };
            }
        }

        return { knockedOut: false, finalDamage: context.amount };
    }

    public knockOut(attacker?: PokemonCard, discard: boolean = true) {
        if (this.engine.simulation && this.attachments.cards.some(c => !c.def)) parentPort?.postMessage("==============================================");
        this.engine.send(...this.fullTokens, "was knocked out!");
        for (const status of this.modifiers) {
            status.modifier.notify_knockedOut({
                engine: this.engine,
                owner: this.owner,
                card: this
            }, attacker);
        }
        if (discard) {
            this.discard();
        }
        for (let i = 0; i < this.def.prizes; i++) {
            if (this.owner.opponent.prizes.count) {
                this.owner.opponent.takePrize();
            }
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
        const status = this.statuses.find(s => s.def === def.name);
        if (status) {
            this.statuses.splice(this.statuses.indexOf(status), 1);
        }
        this.statuses.push({ def: def.name, args: args });
        this.orientation = def.orientation ?? this.orientation;
        def.modifier.notify_given({
            engine: this.engine,
            owner: this.owner,
            card: this
        }, args);
    }

    public removeStatus(def: StatusDef) {
        const status = this.statuses.find(s => s.def === def.name);
        if (status) {
            this.statuses.splice(this.statuses.indexOf(status), 1);
            if (def.orientation) {
                this.orientation = "normal";
            }
            def.modifier.notify_removed({
                engine: this.engine,
                owner: this.owner,
                card: this
            }, status.args);
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

    public override notify_premove(_oldLocation: Location, newLocation: Location) {
        if (newLocation !== this.owner.active) {
            this.clearStatus();
        }
        if (!newLocation.inPlay) {
            this.damage = 0;
            this.evolutionEligible = false;
            while (this.attachments.count) {
                this.attachments.cards[0].discard();
            }
        }
    }
};
