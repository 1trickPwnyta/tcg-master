import { Game } from "../Game.js";
import { Move } from "../interaction/moves/Move.js";
import { Move_DrawCards } from "../interaction/moves/Move_DrawCards.js";
import { MoveRequest } from "../interaction/moves/MoveRequest.js";
import { MoveTarget_String } from "../interaction/moves/MoveTarget_String.js";
import { Player } from "../Player.js";
import { GamePhase, GamePhaseMoveStatus } from "./GamePhase.js";
import { GamePhase_ActivePokemonSelection } from "./GamePhase_ActivePokemonSelection.js";

export class GamePhase_MulliganBonusDraw extends GamePhase {
    private player: Player;

    public constructor(player: Player) {
        super();
        this.player = player;
    }

    public override evaluate(game: Game): GamePhase {
        if (this.moveStatus == GamePhaseMoveStatus.Pending) {
            const draws = game.mulligansTaken[this.player.opponent.id];
            game.moves.requestMove(new MoveRequest(
                Move_DrawCards,
                this.player,
                `${this.player.opponent} had to take ${draws} mulligan(s). Would you like to draw additional cards?`,
                Array.from({ length: draws }, (_, i) => ({ key: (i + 1).toString(), target: new MoveTarget_String((i + 1).toString()) }))
            ));
            return this;
        } else if (this.player == game.player1) {
            return new GamePhase_MulliganBonusDraw(game.player2);
        } else {
            return new GamePhase_ActivePokemonSelection(game.player1);
        }
    }
};
