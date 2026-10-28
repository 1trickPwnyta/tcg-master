import { GameEngine } from "../engine/GameEngine.js";
import { Player } from "../Player.js";
import { GamePhase } from "./GamePhase.js";

export class GamePhase_GameOver extends GamePhase<never> {
    private winner: Player;

    public constructor(game: GameEngine, winner: Player) {
        super(game);
        this.winner = winner;
    }

    protected getMoveRequests(_game: GameEngine): never[] {
        return [];
    }

    public evaluate(game: GameEngine): GamePhase<any> {
        game.end(this.winner);
        return this;
    }
};
