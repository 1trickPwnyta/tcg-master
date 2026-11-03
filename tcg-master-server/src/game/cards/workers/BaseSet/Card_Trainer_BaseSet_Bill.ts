import { Card } from "../../CardDatabase.js";
import { PlayContext } from "../CardWorker.js";
import { CardWorker_Trainer } from "../CardWorker_Trainer.js";

@Card("BaseSet.Bill")
export class Card_Trainer_BaseSet_Bill extends CardWorker_Trainer {
    public override readonly name: string = "Bill";
    public override readonly text: string = "Draw 2 cards.";
    public override readonly targeting: boolean = false;

    public override execute(context: PlayContext): boolean {
        const player = context.game.players.active;
        context.game.cards.draw(player.id, 2);
        return true;
    }
};
