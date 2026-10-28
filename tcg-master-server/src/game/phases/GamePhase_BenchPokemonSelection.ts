import { Card } from "../cards/Card.js";
import { GameEngine } from "../engine/GameEngine.js";
import { Move_PlayCard } from "../interaction/moves/Move_PlayCard.js";
import { MoveRequest } from "../interaction/moves/MoveRequest.js";
import { GamePhase } from "./GamePhase.js";
import { GamePhase_GameOver } from "./GamePhase_GameOver.js";

export class GamePhase_BenchPokemonSelection extends GamePhase<MoveRequest<Card | null>> {
    protected getMoveRequests(game: GameEngine): MoveRequest<Card | null>[] {
        return game.players.filter(p => p.hand.basicPokemon.length).map(p => new MoveRequest(
            Move_PlayCard,
            p,
            "Choose other basic Pokémon to put on the bench.",
            MoveRequest.choices(p.hand.basicPokemon)
        ));
    }
    
    public evaluate(game: GameEngine): GamePhase<MoveRequest<Card | null>> {
        console.log(this.playersPending);
        if (this.playersPending.some(p => p.hand.basicPokemon.length)) {
            return this;
        } else {
            return new GamePhase_GameOver(game, game.player1);
        }
    }
};
