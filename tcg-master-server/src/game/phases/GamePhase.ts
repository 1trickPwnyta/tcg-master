import { Game } from "../Game.js";
import { GameObject } from "../GameObject.js";
import { Move } from "../interaction/moves/Move.js";
import { MoveRequest } from "../interaction/moves/MoveRequest.js";
import { Player } from "../Player.js";

export abstract class GamePhase<T extends MoveRequest<any>> {
    private game: Game;

    public constructor(game: Game) {
        this.game = game;
    }

    public init() {
        const requests = this.getMoveRequests(this.game);
        if (requests.length) {
            for (const request of requests) {
                this.game.moves.requestMove(request);
            }
        } else {
            this.game.update();
        }
    }

    protected get playersPending(): Player[] {
        return [ ...this.game.moves.requestedMove.keys() ];
    }

    public notify_playerResponded(move: Move<GameObject | string | null>) {
        const requestedMove = this.game.moves.requestedMove.get(move.player);
        if (requestedMove && move instanceof requestedMove.type) {
            this.game.moves.requestedMove.delete(move.player);
        }
    }

    protected abstract getMoveRequests(game: Game): T[];

    public abstract evaluate(game: Game): GamePhase<any>;

    public copy(game: Game): GamePhase<T> {
        return new (this.constructor as new (game: Game) => this)(game);
    }
};
