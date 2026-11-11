import { ICardDefData_Trainer, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import path from "path";
import { pathToFileURL } from "url";
import { TrainerWorker } from "../game/trainers/TrainerWorker.js";
import { Modifier } from "../game/modifiers/Modifier.js";

const __dirname = import.meta.dirname;

export class TrainerCardDef extends CardDef {
    public override readonly kind = "trainer";
    public readonly text: string;
    public readonly workers: TrainerWorker[];
    public readonly modifiers: Modifier[];
    public readonly preannounce: boolean;

    private readonly cardData: IDefData & ICardDefData_Trainer;

    public constructor(defClass: string, data: IDefData) {
        super(defClass, data);
        this.cardData = data as IDefData & ICardDefData_Trainer;
        this.text = this.cardData.text;
        this.workers = [];
        this.modifiers = [];
        this.preannounce = this.cardData.preannounce ?? false;
    }

    public override async init() {
        for (const workerData of this.cardData.workers) {
            const workerClass = typeof workerData === "string" ? workerData : workerData.class;
            const workerArgs = typeof workerData !== "string" ? workerData.args : [];
            const fullName = path.join(__dirname, "..", "game", "trainers", `${workerClass}.ts`);
            const module = await import(pathToFileURL(fullName).href);
            const workerConstructor = module[workerClass];
            const worker = new workerConstructor(workerArgs);
            this.workers.push(worker);
        }

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

    public override getDetails(): any[] {
        return [
            this.name,
            "<br />",
            this.text
        ];
    }
};
