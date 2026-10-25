import { Game } from "../../Game.js";
import { IMoveTarget } from "./IMoveTarget.js";
import { Move } from "./Move.js";
import { MoveRequest } from "./MoveRequest.js";
import { MoveTarget_Cancel } from "./MoveTarget_Cancel.js";

export class MoveHandler {
    private readonly game: Game;
    private requestedMove: MoveRequest<IMoveTarget> | null = null;

    public constructor(game: Game) {
        this.game = game;
    }

    public getRequestedMove(): MoveRequest<IMoveTarget> | null {
        return this.requestedMove;
    }

    public requestMove<T extends IMoveTarget>(request: MoveRequest<T>) {
        this.requestedMove = request as any;
        this.requestedMove!.send();
    }

    public makeMove(move: Move<IMoveTarget>) {
        const rejectionReason = this.validateMove(move);
        if (!rejectionReason) {
            if (!(move.target instanceof MoveTarget_Cancel)) {
                move.execute();
                this.game.notify_moveExecuted(move);
                this.game.update();
            } else {
                this.game.notify_moveCancelled(move);
            }
        } else {
            move.player.send(rejectionReason);
        }
    }

    private validateMove(move: Move<IMoveTarget>): string | null {
        if (!this.requestedMove) {
            return "No move expected at this time.";
        }
        if (move.player != this.requestedMove.player) {
            return `Expecting a move from ${this.requestedMove.player} but received a move from ${move.player}.`;
        }
        if (!this.requestedMove.choices.map(c => c.target).includes(move.target)) {
            return `Unexpected target ${move.target}.`;
        }
        return null;
    }

    public update() {
        this.requestedMove?.send();
    }
};

