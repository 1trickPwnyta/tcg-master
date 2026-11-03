import { IToken } from "../../../IToken.js";
import { CardWorker, PlayContext } from "./CardWorker.js";

export abstract class CardWorker_Trainer extends CardWorker {
    public override readonly kind = "trainer";
    public abstract readonly text: string;
    public abstract readonly targeting: boolean;

    public get token(): IToken {
        return { name: this.name, type: "trainer" };
    }

    public override play(context: PlayContext): boolean {
        context.game.moveCard(context.card.id, context.player.hand.id, context.player.limbo.id);
        if (!this.targeting) {
            context.game.send(context.player, "used", context.card, ".");
            this.execute(context);
            context.game.moveCard(context.card.id, context.player.limbo.id, context.player.discard.id);
        } else {
            this.execute(context);
        }
        return true;
    }

    public abstract execute(context: PlayContext, ...args: (number | string | null | undefined)[]): boolean;

    public override getDetails(): any[] {
        return [
            this.name,
            "<br />",
            this.text
        ];
    }
};
