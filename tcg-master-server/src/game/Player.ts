import { Card } from "./Card.js";
import { Deck } from "./Deck.js";
import { Card_Pokemon } from "./Card_Pokemon.js";
import { Card_Pokemon_Pokemon } from "./cards/dev/Card_Pokemon_Pokemon.js";
import { Card_Energy_Energy } from "./cards/dev/Card_Energy_Energy.js";
import { Client } from "../Client.js";
import { Game } from "./Game.js";
import { Pronoun } from "../users/Pronoun.js";
import { Prompt } from "./Prompt.js";
import { Cards } from "./Cards.js";

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
    public hand: Cards = new Cards();
    public discard: Cards = new Cards();
    public prizes: Cards = new Cards();
    public bench: Card_Pokemon[] = [];
    public active: Card_Pokemon | undefined;
    private _prompt: Prompt | null = null;

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

    public set prompt(prompt: Prompt | null) {
        this._prompt = prompt;
        if (this._prompt) {
            this._prompt.player = this;
            this._prompt.send();
        } else {
            this.client?.prompt(null);
        }
    }

    public draw(qty: number = 1) {
        for (let i = 0; i < qty; i++) {
            const drawn = this.deck.draw();
            this.hand.add(drawn);
            if (qty <= 3) {
                this.send(`You drew ${drawn}.`);
            }
        }
        const drawMessage = `${this.name} drew ${qty} card(s).`;
        if (qty <= 3) {
            this.opponent.send(drawMessage);
        } else {
            this.game.send(drawMessage);
        }
    }
};
