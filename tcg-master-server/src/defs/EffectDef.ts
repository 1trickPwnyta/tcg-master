import path from "path";
import { Def } from "./Def.js";
import { IDefData, IDefData_Effect } from "./IDefData.js";
import { pathToFileURL } from "url";
import { EffectWorker } from "../game/effects/EffectWorker.js";

const __dirname = import.meta.dirname;

export class EffectDef extends Def {
    private _worker?: EffectWorker;

    private readonly effectData: IDefData & IDefData_Effect;

    public get worker(): EffectWorker {
        return this._worker!;
    }

    public constructor(defClass: string, data: IDefData & IDefData_Effect) {
        super(defClass, data);
        this.effectData = data as IDefData & IDefData_Effect;
    }

    public async init() {
        const workerClass = typeof this.effectData.worker === "string" ? this.effectData.worker : this.effectData.worker.class;
        const workerArgs = typeof this.effectData.worker !== "string" ? this.effectData.worker.args : [];
        const fullName = path.join(__dirname, "..", "game", "effects", `${workerClass}.ts`);
        const module = await import(pathToFileURL(fullName).href);
        const workerConstructor = module[workerClass];
        this._worker = new workerConstructor(workerArgs);
    }
};
