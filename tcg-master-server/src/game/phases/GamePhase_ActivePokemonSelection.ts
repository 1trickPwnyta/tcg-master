import { Card_Pokemon } from "../cards/Card_Pokemon.js";
import { Game } from "../Game.js";
import { Move_ActivePokemonSelection } from "../interaction/moves/Move_ActivePokemonSelection.js";
import { MoveRequest } from "../interaction/moves/MoveRequest.js";
import { GamePhase } from "./GamePhase.js";
import { GamePhase_BenchPokemonSelection } from "./GamePhase_BenchPokemonSelection.js";

export class GamePhase_ActivePokemonSelection extends GamePhase<MoveRequest<Card_Pokemon>> {
    protected override getMoveRequests(game: Game): MoveRequest<Card_Pokemon>[] {
        return game.players.map(p => new MoveRequest(
            Move_ActivePokemonSelection,
            p,
            "Select a basic Pokémon as your active Pokémon.",
            MoveRequest.choices(p.hand.basicPokemon, false)
        ));
    }

    public evaluate(game: Game): GamePhase<any> {
        if (game.players.some(p => p.active.empty)) {
            return this;
        } else {
            return new GamePhase_BenchPokemonSelection(game);
        }
    }
};
