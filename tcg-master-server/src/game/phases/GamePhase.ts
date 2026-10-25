import { Game } from "../Game.js";
import { IMoveTarget } from "../interaction/moves/IMoveTarget.js";
import { Move } from "../interaction/moves/Move.js";
import { MoveRequest } from "../interaction/moves/MoveRequest.js";

export enum GamePhaseMoveStatus {
    Pending,
    Executed,
    Cancelled
};

export abstract class GamePhase {
    private requestedMove: MoveRequest<IMoveTarget> | undefined;
    protected moveStatus: GamePhaseMoveStatus = GamePhaseMoveStatus.Pending;

    public notify_moveExecuted(move: Move<IMoveTarget>) {
        if (this.requestedMove && move instanceof this.requestedMove.type) {
            this.moveStatus = GamePhaseMoveStatus.Executed;
        }
    }

    public notify_moveCancelled(move: Move<IMoveTarget>) {
        if (this.requestedMove && move instanceof this.requestedMove.type) {
            this.moveStatus = GamePhaseMoveStatus.Cancelled;
        }
    }

    public abstract evaluate(game: Game): GamePhase;

    protected requestMove<T extends IMoveTarget>(request: MoveRequest<T>) {
        this.requestedMove = request as any;
    }
};
