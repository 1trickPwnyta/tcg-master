import { Card } from "./cards/Card.js";
import { Deck } from "./Deck.js";
import { Client } from "../Client.js";
import { GameEngine } from "./engine/GameEngine.js";
import { Pronoun } from "../users/Pronoun.js";
import { Prompt } from "./interaction/prompts/Prompt.js";
import { Location } from "./Location.js";
import { Card_Pokemon } from "./cards/Card_Pokemon.js";
import { Location_Single } from "./Location_Single.js";
import { Hand } from "./Hand.js";
import { Bench } from "./Bench.js";
import { Card_Trainer_BaseSet_Switch } from "./cards/BaseSet/Card_Trainer_BaseSet_Switch.js";
import { Card_Pokemon_BaseSet_Starmie } from "./cards/BaseSet/Card_Pokemon_BaseSet_Starmie.js";
import { Card_Pokemon_BaseSet_Staryu } from "./cards/BaseSet/Card_Pokemon_BaseSet_Staryu.js";
import { Card_Energy_BaseSet_WaterEnergy } from "./cards/BaseSet/Card_Energy_BaseSet_WaterEnergy.js";
import { MoveRequest } from "./interaction/moves/MoveRequest.js";
import { Client_AI } from "../ai/Client_AI.js";

export class Player {
    public static new(game: GameEngine, name: string): Player {
        const player: Player = new Player(game, name);
        player.deck = new Deck(game, player);
        player.deck.fill<Card>([
            { card: Card_Pokemon_BaseSet_Staryu, qty: 15 },
            { card: Card_Pokemon_BaseSet_Starmie, qty: 15 },
            { card: Card_Energy_BaseSet_WaterEnergy, qty: 24 },
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
    public game: GameEngine;
    public client: Client | undefined;

    public deck!: Deck;
    public hand: Hand;
    public discard: Location<Card>;
    public prizes: Location<Card>;
    public bench: Bench;
    public active: Location_Single<Card_Pokemon>;
    private _prompt: Prompt | null = null;
    private promptStack: Prompt[] = [];
    private _lastPrompt: Prompt | null = null;

    private constructor(game: GameEngine, name: string) {
        this.game = game;
        this.name = name;
        this.hand = new Hand(this.game, this);
        this.discard = new Location<Card>(this.game, this);
        this.prizes = new Location<Card>(this.game, this);
        this.bench = new Bench(this.game, this);
        this.active = new Location_Single<Card_Pokemon>(this.game, this);
    }

    public get id(): number {
        return this == this.game.player1 ? 0 : 1;
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

    public requestMove(request: MoveRequest<any>) {
        this.client?.requestMove(request);
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
            //this.client?.prompt(null);
            this.game.update();
        }
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

    public copy(requester: Client_AI, game: GameEngine): Player {
        const player = new Player(game, this.name);
        player.pronoun = this.pronoun;
        player.client = this.client?.copy(player, requester.depth + 1);
        player.discard = this.discard.copy(requester, game);
        player.bench = this.bench.copy(requester, game);
        player.active = this.active.copy(requester, game);
        if (requester.player.id === this.id) {
            player.deck = this.deck.copy(requester, game);
            player.hand = this.hand.copy(requester, game);
            player.prizes = this.prizes.copy(requester, game);
        } else {
            player.deck = new Deck(game, player);
            player.deck.addMany(requester.getBeliefDistribution(game, this.deck.count));
            player.hand = new Hand(game, player);
            player.hand.addMany(requester.getBeliefDistribution(game, this.hand.count));
            player.prizes = new Location<Card>(game, player);
            player.prizes.addMany(requester.getBeliefDistribution(game, this.prizes.count));
        }
        return player;
    }
};
