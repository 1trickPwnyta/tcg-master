import { Card_Pokemon } from "../cards/Card_Pokemon.js";
import { Game } from "../Game.js";
import { Move_ActivePokemonSelection } from "../interaction/moves/Move_ActivePokemonSelection.js";
import { MoveRequest } from "../interaction/moves/MoveRequest.js";
import { Player } from "../Player.js";
import { GamePhase } from "./GamePhase.js";
import { GamePhase_BenchPokemonSelection } from "./GamePhase_BenchPokemonSelection.js";

export class GamePhase_ActivePokemonSelection extends GamePhase {
    private player: Player;

    public constructor(player: Player) {
        super();
        this.player = player;
    }

    public evaluate(game: Game): GamePhase {
        if (this.player.active.empty) {
            this.requestMove(new MoveRequest(
                Move_ActivePokemonSelection,
                this.player,
                "Select a basic Pokémon as your active Pokémon.",
                MoveRequest.choices(this.player.hand.basicPokemon, false)
            ));
            return this;
        } else if (this.player == game.player1) {
            return new GamePhase_ActivePokemonSelection(game.player2);
        } else {
            return new GamePhase_BenchPokemonSelection(game.player1);
        }
    }
};
