import { IDefData, IDefData_Status } from "./IDefData.js";
import { Def } from "./Def.js";
import path from "path";
import { pathToFileURL } from "url";
import { Modifier as Modifier } from "../game/modifiers/Modifier.js";

const __dirname = import.meta.dirname;

export class StatusDef extends Def {
    private _modifier: Modifier | undefined;
    private readonly cardData: IDefData & IDefData_Status;
    public readonly orientation?: "normal" | "confused" | "paralyzed" | "asleep";
    public readonly canAttack: boolean;
    public readonly canRetreat: boolean;
    public readonly permanent: boolean;

    public get modifier(): Modifier {
        return this._modifier!;
    }

    public constructor(defClass: string, data: IDefData) {
        super(defClass, data);
        this.cardData = data as IDefData & IDefData_Status;
        this.orientation = this.cardData.orientation;
        this.canAttack = this.cardData.canAttack ?? true;
        this.canRetreat = this.cardData.canRetreat ?? true;
        this.permanent = this.cardData.permanent ?? false;
    }

    public override async init() {
        const workerClass = typeof this.cardData.modifier === "string" ? this.cardData.modifier : this.cardData.modifier.class;
        const workerArgs = typeof this.cardData.modifier !== "string" ? this.cardData.modifier.args : [];
        const fullName = path.join(__dirname, "..", "game", "modifiers", `${workerClass}.ts`);
        const module = await import(pathToFileURL(fullName).href);
        const workerConstructor = module[workerClass];
        const worker = new workerConstructor(this, workerArgs);
        this._modifier = worker;
    }
};
