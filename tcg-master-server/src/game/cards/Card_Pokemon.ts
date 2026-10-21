import { Card } from "./Card.js";
import { Prompt } from "../interaction/prompts/Prompt.js";
import { Location } from "../Location.js";
import { Attack } from "./Attack.js";
import { Token } from "../../Client.js";

export abstract class Card_Pokemon extends Card {
    public get tokenType(): string {
        return "pokemon";
    }

    public abstract readonly stage: EvolutionStage;
    public abstract readonly hp: number;
    public abstract readonly attacks: Attack[];

    private _damageCounters: number = 0;
    public readonly energy: Location<Card> = new Location<Card>();

    public get damageCounters(): number {
        return this._damageCounters;
    }

    public set damageCounters(n: number) {
        this.game.send(this.owner, "'s", this, "took", { toString: () => n * 10, tokenType: "damage" }, "damage!");
        this._damageCounters = n;
        if (this._damageCounters * 10 >= this.hp) {
            this.knockOut();
        }
    }

    public get isActive(): boolean {
        return this.location == this.owner.active;
    }

    public override play() {
        if (this.owner.bench.count < 5) {
            this.game.send(this.owner, "put", this, "on", this.owner.pronoun.possessive, "bench.");
            this.owner.bench.add(this.take() as Card_Pokemon);
        } else {
            this.owner.send("The bench is full.");
        }
    }

    public knockOut() {
        this.game.send(this.owner, "'s", this, "was knocked out!");
        this.owner.opponent.takePrize();
        if (this.isActive) {
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
        this.reset();
        this.owner.discard.add(this.take());
    }

    public reset() {
        this._damageCounters = 0;
        this.energy.cards.forEach(c => this.owner.discard.add(c.take()));
    }

    public override getDetails(): any[] {
        return [ this, { toString: () => `[${this.hp} HP]`, tokenType: "hp" }, "<br />", ...this.attacks.map(a => a.getDetails()) ];
    }

    public getStatus(): any[] {
        return [
            this,
            { toString: () => `[${this.hp - this.damageCounters * 10} / ${this.hp} HP]`, tokenType: "hp" },
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
