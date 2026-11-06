import { PlayContext } from "../game/cards/workers/CardWorker.js";
import { IToken } from "../IToken.js";
import { Def } from "./Def.js";

export abstract class CardDef extends Def {
    public abstract readonly kind: "pokemon" | "trainer" | "energy";

    public override get token(): IToken {
        return { name: this.label, type: this.kind };
    }

    public abstract play(context: PlayContext): boolean;
};
