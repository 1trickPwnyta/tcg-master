import { Socket } from "socket.io";
import { Client_Human } from "../Client_Human.js";
import { Player } from "./Player.js";
import { Prompt } from "./interaction/prompts/Prompt.js";
import { Client_AI } from "../ai/Client_AI.js";
import Choice_PlayCard from "./interaction/choices/Choice_PlayCard.js";
import Choice_Attack from "./interaction/choices/Choice_Attack.js";
import Choice_EndTurn from "./interaction/choices/Choice_EndTurn.js";
import { GameStarter } from "./GameStarter.js";
import { Token } from "../Client.js";

export enum GameState {
    Setup,
    Main,
    Between,
    Ended
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

    private _state: GameState = GameState.Setup;
    private current!: Player;
    public energyPlayed: boolean = false;

    private constructor() {
        this.player1 = Player.new(this, "Pikachu");
        this.player2 = Player.new(this, "COM");
    }

    public get players(): Player[] {
        return [ this.player1, this.player2 ];
    }

    public get state(): GameState {
        return this._state;
    }

    public getPlayer(client: string): Player | undefined {
        return [ this.player1, this.player2 ].find(p => p.client instanceof Client_Human && (p.client as Client_Human)?.socket.id === client);
    }

    public start() {
        GameStarter.startGame(this);
    }

    public setState(state: GameState) {
        if (this._state != GameState.Ended) {
            this._state = state;
        }
    }

    public update() {
        switch (this._state) {
            case GameState.Setup: this.updateSetup(); break;
            case GameState.Main: this.updateMain(); break;
            case GameState.Between: this.beginTurn(this.current.opponent); break;
        }
    }

    private updateSetup() {
        if (!this.players.some(p => p.active.empty)) {
            this.beginTurn(this.player1);
        }
    }

    private updateMain() {
        this.current.setPrompt(new Prompt(
            "Your turn.",
            [
                Choice_PlayCard(this.current),
                Choice_Attack(this, this.current),
                Choice_EndTurn(this, this.current)
            ]
        ));
    }

    private beginTurn(player: Player) {
        this.energyPlayed = false;
        this._state = GameState.Main;
        this.current = player;
        this.send("Begin", player, "'s turn.");
        player.draw();
        this.update();
    }

    public end(winner: Player, ...reason: any[]) {
        this._state = GameState.Ended;
        this.send(...reason, winner, "wins!");
        this.players.forEach(p => p.notify_gameOver());
    }

    public send(...parts: any[]) {
        this.players.forEach(p => {
            p.send(...parts);
        });
    }
};
