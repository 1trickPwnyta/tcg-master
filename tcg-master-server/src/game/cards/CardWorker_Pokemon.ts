import { IToken } from "../../IToken.js";
import { AttackWorker } from "./AttackWorker.js";
import { CardWorker, PlayContext } from "./CardWorker.js";

export abstract class CardWorker_Pokemon extends CardWorker {
    public abstract readonly evo: "basic" | "stage1" | "stage2";
    public abstract readonly hp: number;
    public abstract readonly attacks: AttackWorker[];

    public get token(): IToken {
        return { name: this.name, type: "pokemon" };
    }

    public override play(context: PlayContext) {
        if (this.evo === "basic") {
            if (context.game.activePlayer.bench.cards.length >= 5) {
                context.game.sendTo(context.game.activePlayer, "Your bench is full.");
            } else {
                context.game.moveCard(context.card.id, context.game.activePlayer.hand.id, context.game.activePlayer.bench.id);
                context.game.send(context.game.activePlayer, "placed", context.card, "on", context.game.activePlayer.pronouns.possessive, "bench.");
            }
        } else {

        }
    }
};
