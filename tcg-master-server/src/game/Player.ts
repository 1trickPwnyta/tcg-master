import { Card } from "./cards/Card.js";
import { Deck } from "./Deck.js";
import { Client } from "../Client.js";
import { Game } from "./Game.js";
import { Pronoun } from "../users/Pronoun.js";
import { Prompt } from "./interaction/prompts/Prompt.js";
import { Location } from "./Location.js";
import { Card_Pokemon } from "./cards/Card_Pokemon.js";
import { Location_Single } from "./Location_Single.js";
import { Hand } from "./Hand.js";
import { Bench } from "./Bench.js";
import { Card_Pokemon_BaseSet_Vulpix } from "./cards/BaseSet/Card_Pokemon_BaseSet_Vulpix.js";
import { Card_Trainer_BaseSet_Switch } from "./cards/BaseSet/Card_Trainer_BaseSet_Switch.js";
import { Card_Pokemon_BaseSet_Ninetales } from "./cards/BaseSet/Card_Pokemon_BaseSet_Ninetales.js";
import { Card_Energy_BaseSet_FireEnergy } from "./cards/BaseSet/Card_Energy_BaseSet_FireEnergy.js";

export class Player {
    public static new(game: Game, name: string): Player {
        const player: Player = new Player(game, name);
        player.deck = new Deck(player);
        player.deck.fill<Card>([
            { card: Card_Pokemon_BaseSet_Ninetales, qty: 10 },
            { card: Card_Pokemon_BaseSet_Vulpix, qty: 20 },
            { card: Card_Energy_BaseSet_FireEnergy, qty: 24 },
            { card: Card_Trainer_BaseSet_Switch, qty: 6 }
        ]);
        return player;
    }

    public name: string;
    public readonly tokenType: string = "player";
    public pronoun: Pronoun = {
        objective: "they",
        possessive: "their"
    };
    public game: Game;
    public client: Client | undefined;

    public deck!: Deck;
    public hand: Hand = new Hand();
    public discard: Location<Card> = new Location<Card>();
    public prizes: Location<Card> = new Location<Card>();
    public bench: Bench = new Bench();
    public active: Location_Single<Card_Pokemon> = new Location_Single<Card_Pokemon>();
    private _prompt: Prompt | null = null;
    private promptStack: Prompt[] = [];
    private _lastPrompt: Prompt | null = null;

    private constructor(game: Game, name: string) {
        this.game = game;
        this.name = name;
    }

    public get opponent(): Player {
        return this.game.player1 == this ? this.game.player2 : this.game.player1;
    }

    public get allPokemonInPlay(): Card_Pokemon[] {
        return [ ...(this.active.single ? [ this.active.single ] : []), ...this.bench.cards ];
    }

    public flipCoin(): boolean {
        if (Math.random() < 0.5) {
            this.game.send(this, "flipped a coin. It was", "heads", "!");
            return true;
        } else {
            this.game.send(this, "flipped a coin. It was", "tails", "!");
            return false;
        }
    }

    public send(...parts: any[]) {
        this.client?.send(...parts);
    }

    public error(message: string) {
        this.client?.error(message);
    }

    public get prompt(): Prompt | null {
        return this._prompt;
    }

    public setPrompt(prompt: Prompt) {
        if (this._prompt) {
            this.promptStack.push(prompt);
        } else {
            this._prompt = prompt;
            this._prompt.player = this;
            this._prompt.send();
        }
    }

    public lastPrompt() {
        if (this._lastPrompt) {
            this._prompt = null;
            this.setPrompt(this._lastPrompt);
        }
    }

    public clearPrompt() {
        this._lastPrompt = this._prompt;
        this._prompt = null;
        if (this.promptStack.length) {
            const nextPrompt = this.promptStack.pop()!;
            this.setPrompt(nextPrompt);
        } else {
            this.client?.prompt(null);
            this.game.update();
        }
    }

    public notify_gameOver() {
        this._prompt = null;
        this.client?.prompt(new Prompt("Game over!", []));
    }

    public draw(qty: number = 1) {
        for (let i = 0; i < qty; i++) {
            const drawn = this.deck.draw();
            this.hand.add(drawn);
            if (qty <= 3) {
                this.send("You drew", drawn, ".");
            }
        }
        const drawMessage = [ this, `drew ${qty} card(s).` ];
        if (qty <= 3) {
            this.opponent.send(...drawMessage);
        } else {
            this.game.send(...drawMessage);
        }
    }

    public takePrize() {
        this.hand.add(this.prizes.take(0)!);
        this.game.send(this, "took a prize.");
        if (this.prizes.empty) {
            this.game.end(this, `${this} took ${this.pronoun.possessive} last prize.`);
        }
    }

    public toString(): string {
        return this.name;
    }
};
