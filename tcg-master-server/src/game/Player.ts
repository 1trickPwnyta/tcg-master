import { Card } from "./cards/Card.js";
import { Deck } from "./Deck.js";
import { Card_Pokemon_Pokemon } from "./cards/dev/Card_Pokemon_Pokemon.js";
import { Card_Energy_Energy } from "./cards/dev/Card_Energy_Energy.js";
import { Client } from "../Client.js";
import { Game } from "./Game.js";
import { Pronoun } from "../users/Pronoun.js";
import { Prompt } from "./interaction/prompts/Prompt.js";
import { Location } from "./Location.js";
import { Card_Pokemon } from "./cards/Card_Pokemon.js";
import { Location_Single } from "./Location_Single.js";
import { Hand } from "./Hand.js";

export class Player {
    public static new(game: Game, name: string): Player {
        const player: Player = new Player(game, name);
        player.deck = new Deck(player);
        player.deck.fill<Card>([
            { card: Card_Pokemon_Pokemon, qty: 30 },
            { card: Card_Energy_Energy, qty: 30 }
        ]);
        return player;
    }

    public name: string;
    public pronoun: Pronoun = { possessive: "their" };
    public game: Game;
    public client: Client | undefined;

    public deck!: Deck;
    public hand: Hand = new Hand();
    public discard: Location<Card> = new Location<Card>();
    public prizes: Location<Card> = new Location<Card>();
    public bench: Location<Card_Pokemon> = new Location<Card_Pokemon>();
    public active: Location_Single<Card_Pokemon> = new Location_Single<Card_Pokemon>();
    private _prompt: Prompt | null = null;
    private nextPrompt: Prompt | null = null;
    private _lastPrompt: Prompt | null = null;

    private constructor(game: Game, name: string) {
        this.game = game;
        this.name = name;
    }

    public get opponent(): Player {
        return this.game.player1 == this ? this.game.player2 : this.game.player1;
    }

    public send(message: string) {
        this.client?.send(message);
    }

    public error(message: string) {
        this.client?.error(message);
    }

    public get prompt(): Prompt | null {
        return this._prompt;
    }

    public setPrompt(prompt: Prompt) {
        if (this._prompt) {
            this.nextPrompt = prompt;
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
        if (this.nextPrompt) {
            const nextPrompt = this.nextPrompt;
            this.nextPrompt = null;
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
                this.send(`You drew ${drawn}.`);
            }
        }
        const drawMessage = `${this} drew ${qty} card(s).`;
        if (qty <= 3) {
            this.opponent.send(drawMessage);
        } else {
            this.game.send(drawMessage);
        }
    }

    public takePrize() {
        this.hand.add(this.prizes.take(0)!);
        this.game.send(`${this} took a prize.`);
        if (this.prizes.empty) {
            this.game.end(this, `${this} took ${this.pronoun.possessive} last prize.`);
        }
    }

    public toString(): string {
        return this.name;
    }
};
