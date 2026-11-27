import { Client } from "../../Client.js";
import { IToken } from "../../IToken.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Active } from "./Active.js";
import { Bench } from "./Bench.js";
import { Card } from "./Card.js";
import { Deck } from "./Deck.js";
import { Hand } from "./Hand.js";
import { Limbo } from "./Limbo.js";
import { Location } from "./Location.js";
import { PokemonCard } from "./PokemonCard.js";
import { Serializable, Serialize } from "./serializer.js";
import { State } from "./State.js";

export type PlayerView = {
    self: {
        id: number,
        name: string,
        active?: PokemonCard,
        bench: PokemonCard[],
        hand: Card[],
        discard: Card[],
        deck: number,
        prizes: number
    };
    opponent: {
        id: number,
        name: string,
        active?: PokemonCard,
        bench: PokemonCard[],
        hand: number,
        discard: Card[],
        deck: number,
        prizes: number
    };
};

@Serializable()
export class Player extends State {
    @Serialize()
    public readonly name: string;

    @Serialize()
    public readonly pronouns: {
        subjective: string;
        possessive: string;
    };

    @Serialize()
    public readonly active: Location;

    @Serialize()
    public readonly bench: Bench;

    @Serialize()
    public readonly limbo: Limbo;

    @Serialize()
    public readonly hand: Hand;

    @Serialize()
    public readonly discard: Location;

    @Serialize()
    public readonly prizes: Location;

    @Serialize()
    public readonly deck: Deck;

    @Serialize()
    public mulligans: number = 0;

    @Serialize()
    public mulliganBonusUsed: boolean = false;

    @Serialize()
    public setupComplete: boolean = false;

    @Serialize()
    public menus: number = 0;

    public get token(): IToken {
        return { name: this.name, type: `player${this.id}` };
    }

    public get opponent(): Player {
        return this.engine.game.players.find(p => p.id !== this.id)!;
    }

    public get activePokemon(): PokemonCard | undefined {
        return this.active.cards[0] as PokemonCard | undefined;
    }

    public get pokemonInPlay(): PokemonCard[] {
        return this.locations.filter(l => l.inPlay).flatMap(l => l.cards).filter(c => c.def.kind === "pokemon").map(c => c as PokemonCard);
    }

    public get locations(): Location[] {
        return [ this.active, this.bench, this.limbo, this.hand, this.discard, this.prizes, this.deck ];
    }

    public get view(): PlayerView {
        return {
            self: {
                id: this.id,
                name: this.name,
                active: this.activePokemon,
                bench: this.bench.cards,
                hand: this.hand.cards,
                discard: this.discard.cards,
                deck: this.deck.count,
                prizes: this.prizes.count
            },
            opponent: {
                id: this.opponent.id,
                name: this.opponent.name,
                active: this.opponent.activePokemon,
                bench: this.opponent.bench.cards,
                hand: this.opponent.hand.count,
                discard: this.opponent.discard.cards,
                deck: this.opponent.deck.count,
                prizes: this.opponent.prizes.count
            }
        };
    }

    public constructor(id: number, engine: GameEngine, name: string) {
        super(id, engine);
        this.name = name;
        this.pronouns = {
            subjective: "they",
            possessive: "their"
        };
        this.active = new Active(id * 10 + 0, this.engine, this);
        this.bench = new Bench(id * 10 + 1, this.engine, this);
        this.limbo = new Limbo(id * 10 + 6, this.engine, this);
        this.hand = new Hand(id * 10 + 2, this.engine, this);
        this.discard = new Location(id * 10 + 3, this.engine, this);
        this.prizes = new Location(id * 10 + 4, this.engine, this);
        this.deck = new Deck(id * 10 + 5, this.engine, this);
    }

    public draw(amount: number = 1) {
        const original = this.deck.count;
        amount = Math.min(amount, this.deck.count);
        const cardsDrawn = [];
        for (let i = 0; i < amount; i++) {
            const card = this.deck.cards[this.deck.count - 1];
            if (!card) {
                debugger;
            }
            this.hand.add(card);
            cardsDrawn.push(card);
        }
        if (amount > 5) {
            this.engine.send(this, "drew", amount, `card${amount > 1 ? "s" : ""}.`)
        } else {
            this.engine.sendTo(this.opponent, this, "drew", amount > 1 ? `${amount} cards` : "a card", ".")
            this.engine.sendTo(this, "You drew", ...(cardsDrawn.length > 1 ? Client.getCardList(cardsDrawn) : cardsDrawn), ".");
        }
    }

    public takePrize() {
        const card = this.prizes.cards[0];
        this.hand.add(card);
        this.engine.sendTo(this.opponent, this, "took a prize.");
        this.engine.sendTo(this, "You took", card, "as a prize.");
        if (this.prizes.count <= 0) {
            this.engine.end(this.id);
        }
    }
};
