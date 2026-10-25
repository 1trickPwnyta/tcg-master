import { Socket } from "socket.io";
import { Client_Human } from "../Client_Human.js";
import { Player } from "./Player.js";
import { Prompt } from "./interaction/prompts/Prompt.js";
import { Client_AI } from "../ai/Client_AI.js";
import Choice_PlayCard from "./interaction/choices/Choice_PlayCard.js";
import Choice_Attack from "./interaction/choices/Choice_Attack.js";
import Choice_EndTurn from "./interaction/choices/Choice_EndTurn.js";
import Choice_Retreat from "./interaction/choices/Choice_Retreat.js";
import { MoveHandler } from "./interaction/moves/MoveHandler.js";
import { GamePhase } from "./phases/GamePhase.js";
import { GamePhase_Setup } from "./phases/GamePhase_Setup.js";
import { Move } from "./interaction/moves/Move.js";
import { IMoveTarget } from "./interaction/moves/IMoveTarget.js";

export class Game {
    public static new(socket1: Socket | null = null, socket2: Socket | null = null): Game {
        const game = new Game();
        game.player1.client = socket1 ? new Client_Human(socket1, game.player1) : new Client_AI(game.player1);
        game.player2.client = socket2 ? new Client_Human(socket2, game.player2) : new Client_AI(game.player2);
        return game;
    }

    public player1: Player;
    public player2: Player;
    public readonly moves: MoveHandler = new MoveHandler(this);
    public prizes: number = 6;
    public planningMode: boolean = false;

    private phase: GamePhase = new GamePhase_Setup();
    private _currentTurn!: Player;
    public mulligansTaken: number[] = [ 0, 0 ];
    public energyPlayed: boolean = false;

    private constructor() {
        this.player1 = Player.new(this, "Pikachu");
        this.player2 = Player.new(this, "COM");
    }

    public get players(): Player[] {
        return [ this.player1, this.player2 ];
    }

    public get currentTurn(): Player {
        return this._currentTurn;
    }

    public getPlayer(client: string): Player | undefined {
        return [ this.player1, this.player2 ].find(p => p.client instanceof Client_Human && (p.client as Client_Human)?.socket.id === client);
    }

    public start() {
        this.update();
    }

    public notify_moveExecuted(move: Move<IMoveTarget>) {
        this.phase.notify_moveExecuted(move);
    }

    public notify_moveCancelled(move: Move<IMoveTarget>) {
        this.phase.notify_moveCancelled(move);
    }

    public update() {
        this.moves.update();
        this.phase = this.phase.evaluate(this);
    }

    private updateSetup() {
        if (!this.players.some(p => p.active.empty)) {
            this.beginTurn(this.player1);
        }
    }

    private updateMain() {
        this._currentTurn.setPrompt(new Prompt(
            "Your turn.",
            [
                Choice_PlayCard(this._currentTurn),
                Choice_Attack(this._currentTurn),
                Choice_Retreat(this._currentTurn),
                Choice_EndTurn(this._currentTurn)
            ]
        ));
    }

    private updateBetween() {
        this.players.forEach(p => {
            p.active.single?.notify_betweenTurns();
            p.bench.cards.forEach(c => {
                c.notify_betweenTurns();
            });
        });
        this.beginTurn(this._currentTurn.opponent);
    }

    private beginTurn(player: Player) {
        this.energyPlayed = false;
        this._phase = GamePhase.Main;
        this._currentTurn = player;
        this.send();
        this.send("Begin", player, "'s turn.");
        player.draw();
        this.update();
    }

    public end(winner: Player, ...reason: any[]) {
        this._phase = GamePhase.Ended;
        this.send(...reason, winner, "wins!");
        this.players.forEach(p => p.client?.notify_gameOver());
    }

    public send(...parts: any[]) {
        this.players.forEach(p => {
            p.send(...parts);
        });
    }

    public copy(): Game {
        const game = new Game();
        game.planningMode = true;
        game.player1 = this.player1.copy(game);
        game.player2 = this.player2.copy(game);
        game._phase = this._phase;
        game._currentTurn = this._currentTurn == this.player1 ? game.player1 : game.player2;
        game.energyPlayed = this.energyPlayed;
        return game;
    }
};
