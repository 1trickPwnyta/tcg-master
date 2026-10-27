import { Move } from "./Move.js";

export class Move_DrawCards extends Move<string | null> {
    public execute(): void {
        if (this.target) {
            this.player.draw(parseInt(this.target));
        }
    }
};
