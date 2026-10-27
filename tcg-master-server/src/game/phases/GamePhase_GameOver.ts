import { Game } from "../Game.js";
import { Player } from "../Player.js";
import { GamePhase } from "./GamePhase.js";

export class GamePhase_GameOver extends GamePhase<never> {
    private winner: Player;

    public constructor(game: Game, winner: Player) {
        super(game);
        this.winner = winner;
    }

    protected getMoveRequests(_game: Game): never[] {
        return [];
    }

    public evaluate(game: Game): GamePhase<any> {
        game.end(this.winner);
        return this;
    }
};
