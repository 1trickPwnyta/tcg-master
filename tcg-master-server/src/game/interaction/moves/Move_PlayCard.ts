import { Card } from "../../cards/Card.js";
import { Move } from "./Move.js";

export class Move_PlayCard extends Move<Card | null> {
    public execute(): void {
        this.target?.play();
    }
}