import { GameEngine } from "../engine/GameEngine.js";
import { GameObject } from "../GameObject.js";
import { Move } from "../interaction/moves/Move.js";
import { MoveRequest } from "../interaction/moves/MoveRequest.js";
import { Player } from "../Player.js";

export abstract class GamePhase<T extends MoveRequest<any>> {
    private game: GameEngine;

    public constructor(game: GameEngine) {
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

    protected abstract getMoveRequests(game: GameEngine): T[];

    public abstract evaluate(game: GameEngine): GamePhase<any>;

    public copy(game: GameEngine): GamePhase<T> {
        return new (this.constructor as new (game: GameEngine) => this)(game);
    }
};
