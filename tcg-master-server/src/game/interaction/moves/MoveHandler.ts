import { GameEngine } from "../../engine/GameEngine.js";
import { Player } from "../../Player.js";
import { GameObject } from "../../GameObject.js";
import { Move } from "./Move.js";
import { MoveRequest } from "./MoveRequest.js";
import { MoveTarget_Cancel } from "./MoveTarget_Cancel.js";

export class MoveHandler {
    private readonly game: GameEngine;
    public readonly requestedMove: Map<Player, MoveRequest<any>> = new Map<Player, MoveRequest<any>>();

    public constructor(game: GameEngine) {
        this.game = game;
    }

    public getRequestedMove(player: Player): MoveRequest<GameObject | string | null> | undefined {
        return this.requestedMove.get(player);
    }

    public requestMove<T extends GameObject>(request: MoveRequest<T>) {
        this.requestedMove.set(request.player, request);
        request.send();
    }

    public makeMove(move: Move<GameObject | string | null>) {
        const rejectionReason = this.validateMove(move);
        if (!rejectionReason) {
            if (!(move.target instanceof MoveTarget_Cancel)) {
                move.execute();
                this.game.notify_moveExecuted(move);
                this.requestedMove.delete(move.player);
                this.game.update();
            } else {
                this.game.notify_moveExecuted(move);
            }
        } else {
            console.log("REJECT");
            move.player.send(rejectionReason);
        }
    }

    private validateMove(move: Move<GameObject | string | null>): string | null {
        if (!this.requestedMove) {
            return "No move expected at this time.";
        }
        if (!this.requestedMove.has(move.player)) {
            return `Not expecting a move from ${move.player} at this time.`;
        }
        const request = this.requestedMove.get(move.player)!;
        if (move.target instanceof GameObject) {
            if (!request.choices.map(c => c.id).includes(move.target.id)) {
                return `Unexpected target ${move.target}.`;
            }
        } else {
            if (!request.choices.map(c => c.id === "cancel" ? null : c.key).includes(move.target)) {
                return `Unexpected target ${move.target}.`;
            }
        }
        return null;
    }

    public update() {
        for (const request of this.requestedMove.values()) {
            request.send();
        }
    }

    public copy(game: GameEngine): MoveHandler {
        const moves = new MoveHandler(game);
        for (const player of this.requestedMove.keys()) {
            moves.requestedMove.set(game.players[player.id], this.requestedMove.get(player)!.copy(game));
        }
        return moves;
    }
};

