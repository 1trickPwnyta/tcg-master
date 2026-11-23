import path from "path";
import { Modifier } from "../game/modifiers/Modifier.js";
import { IToken } from "../IToken.js";
import { Def } from "./Def.js";
import { ICardDefData } from "./IDefData.js";
import { pathToFileURL } from "url";
import { ExpansionDef } from "./ExpansionDef.js";
import { DefDatabase } from "./DefDatabase.js";
import { EnergyTypeDef } from "./EnergyTypeDef.js";

const __dirname = import.meta.dirname;

export abstract class CardDef extends Def {
    public abstract readonly kind: "pokemon" | "trainer" | "energy";
    public readonly expansion: ExpansionDef;
    public readonly cardNumber: number;
    public readonly modifiers: Modifier[];
    public readonly graphicPath: string;

    private readonly cardData: ICardDefData;

    protected get typeAffinity(): EnergyTypeDef | null {
        return null;
    }

    public override get token(): IToken {
        return { name: this.label, type: this.typeAffinity ? `card_${this.typeAffinity.label.toLowerCase()}` : this.kind };
    }

    public constructor(defClass: string, data: ICardDefData) {
        super(defClass, data);
        this.cardData = data;
        this.expansion = DefDatabase.get<ExpansionDef>(this.cardData.expansion ?? "BaseSet");
        this.cardNumber = this.cardData.cardNumber;
        this.modifiers = [];
        this.graphicPath = `${this.expansion.name}/${String(this.cardNumber).padStart(3, "0")}.jpg`;
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
