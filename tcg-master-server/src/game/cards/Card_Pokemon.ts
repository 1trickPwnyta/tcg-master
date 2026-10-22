import { Card } from "./Card.js";
import { Prompt } from "../interaction/prompts/Prompt.js";
import { Attack } from "./Attack.js";
import { EnergyType } from "../EnergyType.js";
import { CardOrientation } from "../CardOrientation.js";
import { Card_Energy } from "./Card_Energy.js";
import { Location } from "../Location.js";
import { EvolutionTree } from "./EvolutionTree.js";
import { Prompt_SelectCard } from "../interaction/prompts/Prompt_SelectCard.js";

export abstract class Card_Pokemon extends Card {
    public get tokenType(): string {
        return "pokemon";
    }

    // Card properties
    public abstract readonly stage: EvolutionStage;
    public abstract readonly evolutionTree: EvolutionTree;
    public abstract readonly type: EnergyType;
    public abstract readonly hp: number;
    public abstract readonly attacks: Attack[];
    public abstract readonly weakness: EnergyType | null;
    public abstract readonly retreatCost: number;

    // Status that potentially needs to be reset in certain circumstances
    private _damageCounters: number = 0;
    private _orientation: CardOrientation = CardOrientation.Normal;
    private poisoned: boolean = false;
    public readonly energy: Location<Card_Energy> = new Location<Card_Energy>();
    public readonly evolutions: Location<Card_Pokemon> = new Location<Card_Pokemon>();

    public evolvesInto(evolution: Card_Pokemon): boolean {
        return this.evolutionTree.evolvesDirect(this.name, evolution.name);
    }

    public evolve(evolution: Card_Pokemon) {
        this.location?.add(evolution.take(), this.location.cards.indexOf(this));
        evolution.evolutions.add(this.take() as Card_Pokemon);
        evolution._damageCounters = this.damageCounters;
        evolution.energy.addMany(this.energy.takeAll());
        evolution.evolutions.addMany(this.evolutions.takeAll());
        this.reset();
        this.game.send(this.owner, "'s", this, "evolved into", evolution, "!");
    }

    public get damageCounters(): number {
        return this._damageCounters;
    }

    public takeDamage(amount: number, type: EnergyType, source: string | undefined = undefined) {
        if (this.weakness === type) {
            amount *= 2;
        }
        if (amount) {
            this.game.send(this.owner, "'s", this, "took", { toString: () => amount, tokenType: "damage" }, "damage", ...(source ? [ "due to", source ] : []), "!");
            this._damageCounters += amount / 10;
            if (this.damageCounters * 10 >= this.hp) {
                this.knockOut();
            }
        }
    }

    public healDamage(amount: number) {
        if (amount) {
            this.game.send(this.owner, "'s", this, "was healed for", { toString: () => amount, tokenType: "heal" }, "HP!");
            this._damageCounters -= amount / 10;
            if (this._damageCounters < 0) {
                this._damageCounters = 0;
            }
        }
    }

    public get orientation(): CardOrientation {
        return this._orientation;
    }

    public set orientation(orientation: CardOrientation) {
        this._orientation = orientation;
        this.game.send(...orientation.message(this));
    }

    public poison() {
        this.poisoned = true;
        this.game.send(this, " was poisoned!");
    }

    public get isActive(): boolean {
        return this.location == this.owner.active;
    }

    public override play() {
        if (this.stage == EvolutionStage.Basic) {
            this.game.send(this.owner, "put", this, "on", this.owner.pronoun.possessive, "bench.");
            this.owner.bench.add(this.take() as Card_Pokemon);
        } else {
            this.owner.setPrompt(new Prompt_SelectCard<Card_Pokemon>(
                `Select a Pokémon to evolve into ${this}.`,
                this.owner.allPokemonInPlay.filter(p => p.evolvesInto(this)),
                (card: Card_Pokemon) => {
                    card.evolve(this);
                    return true;
                },
                {
                    cancelAction: () => false
                }
            ));
        }
    }

    public override get unplayableReason(): string | null {
        if (this.stage == EvolutionStage.Basic) {
            if (this.owner.bench.count >= 5) {
                return "The bench is full";
            }
        } else if (!this.owner.allPokemonInPlay.some(p => p.evolvesInto(this))) {
            return `None of your Pokémon can evolve into ${this}.`
        }
        return null;
    }

    public knockOut() {
        this.game.send(this.owner, "'s", this, "was knocked out!");
        this.reset();
        const wasActive = this.isActive;
        this.owner.discard.add(this.take());
        this.owner.opponent.takePrize();
        if (wasActive) {
            if (this.owner.bench.empty) {
                this.game.end(this.owner.opponent, `${this.owner} has no more Pokémon.`);
            } else {
                this.owner.setPrompt(new Prompt(
                    `Select a Pokémon to take ${this}'s place.`,
                    this.owner.bench.cards.map(c => ({
                        text: c.toString(),
                        action: () => {
                            this.owner.active.single = c.take() as Card_Pokemon;
                            this.owner.opponent.send(this.owner, "sent out", c, ".");
                            return true;
                        }
                    }))
                ));
            }
        }
    }

    public reset() {
        this.clearStatus();
        this._damageCounters = 0;
        this.energy.cards.forEach(c => this.owner.discard.add(c.take()));
    }

    public clearStatus() {
        this._orientation = CardOrientation.Normal;
        this.poisoned = false;
    }

    public switch(replacement: Card_Pokemon) {
        this.clearStatus();
        this.owner.bench.add(this.take() as Card_Pokemon);
        this.owner.active.single = replacement.take() as Card_Pokemon;
    }

    public get canRetreat(): boolean {
        return this.energy.count >= this.retreatCost && !this.owner.bench.empty;
    }

    public payRetreatCost() {
        let paid = 0;
        for (const card of this.energy.cards) {
            paid += card.amount;
            this.owner.discard.add(card.take());
            if (paid >= this.retreatCost) {
                break;
            }
        }
    }

    public notify_betweenTurns() {
        if (this.poisoned) {
            this.takeDamage(10, EnergyType.Colorless, "poison");
        }
    }

    public override getDetails(): any[] {
        return [ this, { toString: () => `[${this.hp} HP]`, tokenType: "hp" }, "<br />", ...this.attacks.map(a => a.getDetails()) ];
    }

    public getStatus(): any[] {
        return [
            this,
            { toString: () => `[${this.hp - this.damageCounters * 10} / ${this.hp} HP]`, tokenType: "hp" },
            this.orientation.toString(),
            ...(this.poisoned ? [ "[🤢]" ] : []),
            "<br />..Energy:",
            ...Card.cardTokens(this.energy.cards)
        ];
    }
};

export enum EvolutionStage {
    Basic,
    Stage1,
    Stage2
};
