import { ICardDefData_Trainer, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import path from "path";
import { pathToFileURL } from "url";
import { TrainerWorker } from "../game/trainers/TrainerWorker.js";
import { PlayContext } from "../game/cards/workers/CardWorker.js";
import { Interrupt } from "../game/state/interrupts/Interrupt.js";

const __dirname = import.meta.dirname;

export class TrainerCardDef extends CardDef {
    public override readonly kind = "trainer";
    public readonly text: string;
    public readonly workers: TrainerWorker[];

    private readonly cardData: IDefData & ICardDefData_Trainer;

    public constructor(data: IDefData) {
        super(data);
        this.cardData = data as IDefData & ICardDefData_Trainer;
        this.text = this.cardData.text;
        this.workers = [];
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
    }

    public override play(context: PlayContext): boolean {
        context.game.cards.move(context.card.id, context.player.hand.id, context.player.limbo.id);

        const interrupt = this.validateTargets(context);
        if (interrupt === "fail") {
            return false;
        } else if (interrupt) {
            context.game.interrupts.interrupt(interrupt);
            return true;
        }

        context.game.send(context.player, "used", context.card, ".");
        this.execute(context);
        context.game.cards.move(context.card.id, context.player.limbo.id, context.player.discard.id);
        
        return true;
    }

    private validateTargets(context: PlayContext, ...targets: number[]): Interrupt | "fail" | null {
        for (const worker of this.workers) {
            const interrupt = worker.validateTargets(context, ...targets);
            if (interrupt) {
                return interrupt;
            }
        }

        return null;
    }

    public execute(context: PlayContext, ...targets: number[]) {
        for (const worker of this.workers) {
            worker.execute(context, ...targets);
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
