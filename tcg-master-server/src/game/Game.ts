import { Socket } from "socket.io";
import { Client_Human } from "../Client_Human.js";
import { Card_Pokemon } from "./Card_Pokemon.js";
import { Player } from "./Player.js";
import { Prompt } from "./Prompt.js";
import { Client_AI } from "../ai/Client_AI.js";

export enum GameState {
    Setup,
    Main,
    Between
};

export class Game {
    public static new(socket1: Socket | null = null, socket2: Socket | null = null): Game {
        const game = new Game();
        game.player1.client = socket1 ? new Client_Human(socket1, game.player1) : new Client_AI(game.player1);
        game.player2.client = socket2 ? new Client_Human(socket2, game.player2) : new Client_AI(game.player2);
        return game;
    }

    public player1: Player;
    public player2: Player;
    public prizes: number = 6;

    private state: GameState = GameState.Setup;
    private current!: Player;

    public get players(): Player[] {
        return [ this.player1, this.player2 ];
    }

    private constructor() {
        this.player1 = Player.new(this, "Pikachu");
        this.player2 = Player.new(this, "COM");
    }

    public getPlayer(client: string): Player | undefined {
        return [ this.player1, this.player2 ].find(p => p.client instanceof Client_Human && (p.client as Client_Human)?.socket.id === client);
    }

    public start() {
        this.players.forEach(p => {
            p.send("Welcome!");
            p.deck.shuffle();
            for (let i = 0; i < this.prizes; i++) {
                p.prizes.add(p.deck.draw());
            }
            p.draw(7);
            const basicPokemon = p.hand.cards.filter(c => c instanceof Card_Pokemon);
            p.prompt = new Prompt(
                "Select a basic Pokémon as your active Pokémon.",
                basicPokemon.map(c => ({
                    text: c.toString(),
                    action: () => {
                        p.active = p.hand.take(c) as Card_Pokemon;
                        return true;
                    }
                }))
            );
        });
    }

    public update() {
        switch (this.state) {
            case GameState.Setup: this.updateSetup(); break;
            case GameState.Between: this.beginTurn(this.current.opponent); break;
        }
    }

    private updateSetup() {
        if (!this.players.some(p => !p.active)) {
            this.beginTurn(this.player1);
        }
    }

    private beginTurn(player: Player) {
        this.state = GameState.Main;
        this.current = player;
        this.send(`Begin ${this.current.name}'s turn.`);
        this.current.draw();
        this.current.prompt = new Prompt(
            "Your turn.",
            [
                {
                    text: "play a card",
                    action: () => {
                        return false;
                    }
                },
                {
                    text: "attack",
                    action: () => {
                        return false;
                    }
                },
                {
                    text: "end turn",
                    action: () => {
                        player.opponent.send(`${player.name} ended ${player.pronoun.possessive} turn.`);
                        this.state = GameState.Between;
                        return true;
                    }
                }
            ]
        );
    }

    public send(message: string) {
        this.players.forEach(p => {
            p.send(message);
        });
    }
};
