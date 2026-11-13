import { ICardDefData_Trainer, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import path from "path";
import { pathToFileURL } from "url";
import { TrainerWorker } from "../game/trainers/TrainerWorker.js";

const __dirname = import.meta.dirname;

export class TrainerCardDef extends CardDef {
    public override readonly kind = "trainer";
    public readonly text: string;
    public readonly workers: TrainerWorker[];
    public readonly preannounce: boolean;

    private readonly trainerData: IDefData & ICardDefData_Trainer;

    public constructor(defClass: string, data: IDefData) {
        super(defClass, data);
        this.trainerData = data as IDefData & ICardDefData_Trainer;
        this.text = this.trainerData.text;
        this.workers = [];
        this.preannounce = this.trainerData.preannounce ?? false;
    }

    public override async init() {
        await super.init();
        for (const workerData of this.trainerData.workers) {
            const workerClass = typeof workerData === "string" ? workerData : workerData.class;
            const workerArgs = typeof workerData !== "string" ? workerData.args : [];
            const fullName = path.join(__dirname, "..", "game", "trainers", `${workerClass}.ts`);
            const module = await import(pathToFileURL(fullName).href);
            const workerConstructor = module[workerClass];
            const worker = new workerConstructor(workerArgs);
            this.workers.push(worker);
        }
    }

    public override getDetails(): any[] {
        return [
            this.name,
            "<br />",
            this.text
        ];
    }
};
