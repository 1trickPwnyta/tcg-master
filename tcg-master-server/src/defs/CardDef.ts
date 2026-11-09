import { IToken } from "../IToken.js";
import { Def } from "./Def.js";

export abstract class CardDef extends Def {
    public abstract readonly kind: "pokemon" | "trainer" | "energy";

    public get token(): IToken {
        return { name: this.label, type: this.kind };
    }
};
