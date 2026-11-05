import { Def } from "./Def.js";

export abstract class CardDef extends Def {
    public abstract readonly kind: "pokemon" | "trainer" | "energy";
};
