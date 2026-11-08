import { IDefData, IDefData_Status } from "./IDefData.js";
import { Def } from "./Def.js";
import { StatusWorker } from "../game/status/StatusWorker.js";
import path from "path";
import { pathToFileURL } from "url";

const __dirname = import.meta.dirname;

export class StatusDef extends Def {
    private _worker: StatusWorker | undefined;
    private readonly cardData: IDefData & IDefData_Status;
    public readonly orientation?: "normal" | "confused" | "paralyzed" | "asleep";
    public readonly canAttack: boolean;
    public readonly canRetreat: boolean;

    public get worker(): StatusWorker {
        return this._worker!;
    }

    public constructor(data: IDefData) {
        super(data);
        this.cardData = data as IDefData & IDefData_Status;
        this.orientation = this.cardData.orientation;
        this.canAttack = this.cardData.canAttack ?? true;
        this.canRetreat = this.cardData.canRetreat ?? true;
    }

    public override async init() {
        const workerClass = typeof this.cardData.worker === "string" ? this.cardData.worker : this.cardData.worker.class;
        const workerArgs = typeof this.cardData.worker !== "string" ? this.cardData.worker.args : [];
        const fullName = path.join(__dirname, "..", "game", "status", `${workerClass}.ts`);
        const module = await import(pathToFileURL(fullName).href);
        const workerConstructor = module[workerClass];
        const worker = new workerConstructor(this, workerArgs);
        this._worker = worker;
    }
};
