import { Game } from "../Game.js";
import { Move_DrawCards } from "../interaction/moves/Move_DrawCards.js";
import { MoveRequest } from "../interaction/moves/MoveRequest.js";
import { GamePhase } from "./GamePhase.js";
import { GamePhase_ActivePokemonSelection } from "./GamePhase_ActivePokemonSelection.js";

export class GamePhase_MulliganBonusDraw extends GamePhase<MoveRequest<string | null>> {
    protected override getMoveRequests(game: Game): MoveRequest<string | null>[] {
        return game.players.filter(p => game.mulligansTaken[p.opponent.id]).map(p => new MoveRequest(
            Move_DrawCards,
            p,
            `${p.opponent} had to take ${game.mulligansTaken[p.opponent.id]} mulligan(s). Would you like to draw additional cards?`,
            Array.from({ length: game.mulligansTaken[p.opponent.id] }, (_, i) => ({ key: (i + 1).toString(), label: (i + 1).toString() }))
        ));
    }

    public override evaluate(game: Game): GamePhase<any> {
        if (this.playersPending.length) {
            return this;
        } else {
            return new GamePhase_ActivePokemonSelection(game);
        }
    }
};
