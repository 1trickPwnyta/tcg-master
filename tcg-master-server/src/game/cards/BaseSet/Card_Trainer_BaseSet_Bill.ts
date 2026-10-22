import { Card_Trainer } from "../Card_Trainer.js";

export class Card_Trainer_BaseSet_Bill extends Card_Trainer {
    public override readonly name: string = "Bill";
    public override readonly text: string = "Draw 2 cards.";

    protected override execute(): boolean {
        this.owner.draw(2);
        return true;
    }
};
