import { Game } from "../Game.js";
import { Move_PlayCard } from "../interaction/moves/Move_PlayCard.js";
import { MoveRequest } from "../interaction/moves/MoveRequest.js";
import { Player } from "../Player.js";
import { GamePhase, GamePhaseMoveStatus } from "./GamePhase.js";

export class GamePhase_BenchPokemonSelection extends GamePhase {
    private player: Player

    public constructor(player: Player) {
        super();
        this.player = player;
    }

    public evaluate(game: Game): GamePhase {
        if (this.moveStatus == GamePhaseMoveStatus.Pending && this.player.hand.basicPokemon.length) {
            this.requestMove(new MoveRequest(
                Move_PlayCard,
                this.player,
                "Choose other basic Pokémon to put on the bench.",
                MoveRequest.choices(this.player.hand.basicPokemon)
            ));
            return this;
        } else if (this.player == game.player1) {
            return new GamePhase_BenchPokemonSelection(game.player2);
        } else {
            // Go to coin flip for first turn??
        }
    }
};
