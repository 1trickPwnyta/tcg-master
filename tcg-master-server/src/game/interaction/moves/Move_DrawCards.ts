import { Move } from "./Move.js";
import { MoveTarget_Cancel } from "./MoveTarget_Cancel.js";
import { MoveTarget_String } from "./MoveTarget_String.js";

export class Move_DrawCards extends Move<MoveTarget_String> {
    public execute(): void {
        if (!(this.target instanceof MoveTarget_Cancel)) {
            this.player.draw(parseInt(this.target.label));
        }
    }
};
