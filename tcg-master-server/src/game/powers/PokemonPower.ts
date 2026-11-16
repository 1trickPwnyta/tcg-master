import path from "path";
import { IPokemonPowerData } from "../../defs/IDefData.js";
import { PokemonPowerContext, PokemonPowerWorker } from "./PokemonPowerWorker.js";
import { pathToFileURL } from "url";
import { IToken } from "../../IToken.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { PokemonPowerModifier } from "../modifiers/PokemonPowerModifier.js";

const __dirname = import.meta.dirname;

export class PokemonPower {
    private readonly powerData: IPokemonPowerData;
    public readonly name: string;
    public readonly text: string;
    public readonly workers: PokemonPowerWorker[];
    public readonly modifiers: PokemonPowerModifier[];

    public get token(): IToken {
        return { name: this.name, type: "power" };
    }

    public get executable(): boolean {
        return this.workers.length > 0;
    }

    public constructor(data: IPokemonPowerData) {
        this.powerData = data;
        this.name = this.powerData.name;
        this.text = this.powerData.text;
        this.workers = [];
        this.modifiers = [];
    }

    public async init() {
        if (this.powerData.workers) {
            for (const workerData of this.powerData.workers) {
                const workerClass = typeof workerData === "string" ? workerData : workerData.class;
                const workerArgs = typeof workerData !== "string" ? workerData.args : [];
                const fullName = path.join(__dirname, `${workerClass}.ts`);
                const module = await import(pathToFileURL(fullName).href);
                const workerConstructor = module[workerClass];
                const worker = new workerConstructor(workerArgs);
                this.workers.push(worker);
            }
        }

        if (this.powerData.modifiers) {
            for (const modifierData of this.powerData.modifiers) {
                const modifierClass = typeof modifierData === "string" ? modifierData : modifierData.class;
                const modifierArgs = typeof modifierData !== "string" ? modifierData.args : [];
                const fullName = path.join(__dirname, "..", "modifiers", `${modifierClass}.ts`);
                const module = await import(pathToFileURL(fullName).href);
                const modifierConstructor = module[modifierClass];
                const modifier = new modifierConstructor(this, modifierArgs);
                this.modifiers.push(modifier);
            }
        }
    }

    public cantUseReason(context: PokemonPowerContext): string | null {
        for (const worker of this.workers) {
            const reason = worker.cantUseReason(context);
            if (reason) {
                return reason;
            }
        }

        return null;
    }

    public use(context: PokemonPowerContext): boolean {
        const interrupt = this.acquireTargets(context);
        if (interrupt) {
            context.engine.interrupts.interrupt(interrupt);
            return true;
        }
        
        this.execute(context);

        return true;
    }

    private execute(context: PokemonPowerContext) {
        context.engine.send(context.owner, "used", context.card, "'s", context.card.def.power, "!");
        for (const worker of this.workers) {
            worker.consolidateTargets(context);
            worker.execute(context, ...worker.getTargets(context));
        }
    }

    private acquireTargets(context: PokemonPowerContext): Interrupt | null {
        for (const worker of this.workers) {
            worker.consolidateTargets(context);
            const interrupt = worker.acquireTargets(context, ...worker.getTargets(context));
            if (interrupt) {
                return interrupt;
            }
        }

        return null;
    }
};
