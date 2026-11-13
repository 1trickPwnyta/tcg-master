import path from "path";
import { Modifier } from "../game/modifiers/Modifier.js";
import { IToken } from "../IToken.js";
import { Def } from "./Def.js";
import { ICardDefData, IDefData } from "./IDefData.js";
import { pathToFileURL } from "url";

const __dirname = import.meta.dirname;

export abstract class CardDef extends Def {
    public abstract readonly kind: "pokemon" | "trainer" | "energy";
    public readonly modifiers: Modifier[];

    private readonly cardData: IDefData & ICardDefData;

    public get token(): IToken {
        return { name: this.label, type: this.kind };
    }

    public constructor(defClass: string, data: IDefData & ICardDefData) {
        super(defClass, data);
        this.cardData = data;
        this.modifiers = [];
    }

    public override async init() {
        for (const workerData of this.cardData.modifiers ?? []) {
            const workerClass = typeof workerData === "string" ? workerData : workerData.class;
            const workerArgs = typeof workerData !== "string" ? workerData.args : [];
            const fullName = path.join(__dirname, "..", "game", "modifiers", `${workerClass}.ts`);
            const module = await import(pathToFileURL(fullName).href);
            const workerConstructor = module[workerClass];
            const worker = new workerConstructor(this, workerArgs);
            this.modifiers.push(worker);
        }
    }
};
