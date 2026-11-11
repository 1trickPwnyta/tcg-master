import path from "path";
import { AttackContext, AttackWorker } from "./AttackWorker.js";
import { IAttackData } from "../../defs/IDefData.js";
import { pathToFileURL } from "url";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { EnergyCard } from "../state/EnergyCard.js";
import { ITargetable } from "../state/Choice.js";

const __dirname = import.meta.dirname;

export class Attack implements ITargetable {
    public readonly name: string;
    public readonly cost: EnergyTypeDef[];
    public readonly damage: number;
    public readonly text?: string;
    public readonly workers: AttackWorker[];

    private readonly attackData: IAttackData;

    public get id(): string {
        return this.name;
    }

    public get targetName(): string {
        return `${this.name} [${this.cost.map(c => c.symbol).join("")}]`;
    }

    public constructor(data: IAttackData) {
        this.attackData = data;
        this.name = this.attackData.name;
        this.cost = this.attackData.cost.map(c => DefDatabase.get<EnergyTypeDef>(c));
        this.damage = this.attackData.damage ?? 0;
        this.text = this.attackData.text;
        this.workers = [];
    }

    public async init() {
        if (this.attackData.workers) {
            for (const workerData of this.attackData.workers) {
                const workerClass = typeof workerData === "string" ? workerData : workerData.class;
                const workerArgs = typeof workerData !== "string" ? workerData.args : [];
                const fullName = path.join(__dirname, `${workerClass}.ts`);
                const module = await import(pathToFileURL(fullName).href);
                const workerConstructor = module[workerClass];
                const worker = new workerConstructor(workerArgs);
                this.workers.push(worker);
            }
        }
    }

    public canUse(context: AttackContext): boolean {
        for (const worker of this.workers) {
            if (!worker.canUse(context)) {
                return false;
            }
        }
        
        return true;
    }

    private validateTargets(context: AttackContext, ...targets: (number | string)[]): Interrupt | null {
        for (const worker of this.workers) {
            const interrupt = worker.validateTargets(context, ...targets);
            if (interrupt) {
                return interrupt;
            }
        }

        return null;
    }

    private preEffects(context: AttackContext, damage: number): number {
        for (const worker of this.workers) {
            damage = worker.preEffect(context, damage);
            if (damage < 0) {
                return damage;
            }
        }

        return damage;
    }

    private postEffects(context: AttackContext, knockedOut: boolean, ...targets: (number | string)[]) {
        for (const worker of this.workers) {
            worker.postEffect(context, knockedOut, ...targets);
        }
    }

    public execute(context: AttackContext, ...targets: (number | string)[]): boolean {
        const interrupt = this.validateTargets(context, ...targets);
        if (interrupt) {
            context.engine.interrupts.interrupt(interrupt);
            return true;
        }

        let failToStatus = false;
        for (const status of context.attacker.modifiers) {
            if (!status.modifier.try_attack({
                engine: context.engine,
                owner: context.engine.game.activePlayer,
                card: context.attacker
            }, context)) {
                failToStatus = true;
                break;
            }
        }

        if (!failToStatus) {
            context.engine.send(context.engine.game.activePlayer, "'s", context.attacker, "used", this.name, "!");
            let damage = this.damage;

            for (const status of context.attacker.modifiers) {
                damage = status.modifier.modifyDamageDealt({
                    engine: context.engine,
                    owner: context.attacker.owner,
                    card: context.attacker
                }, damage, status.args);
                if (damage < 0) {
                    break;
                }
            }
            if (damage >= 0) {
                damage = this.preEffects(context, damage);
                if (damage >= 0) {
                    context.damage = damage;
                    const knockedOut = context.defender.dealDamage({
                        amount: damage,
                        attacker: context.attacker,
                        type: context.attacker.def.type
                    });
                    
                    this.postEffects(context, knockedOut, ...targets);
                }
            }
        }

        context.engine.game.turn!.attacked = true;

        return true;
    }

    private analyzeCost(energy: EnergyCard[]): { unsatisfied: EnergyTypeDef[], oversatisfied: EnergyTypeDef[] } {
        const reqs = [ ...this.cost ].sort((a, b) => b.resolutionPriority - a.resolutionPriority);
        const pool = energy.flatMap(e => Array.from({ length: e.def.amount }, () => e.def.type)).sort((a, b) => a.resolutionPriority - b.resolutionPriority);
        const unsatisfied = [];
        for (let i = 0; i < reqs.length; i++) {
            let satisfied = false;
            for (let j = 0; j < pool.length; j++) {
                if (pool[j].satisfies(reqs[i])) {
                    pool.splice(j, 1);
                    satisfied = true;
                    break;
                }
            }
            if (!satisfied) {
                unsatisfied.push(reqs[i]);
            }
        }

        return { unsatisfied: unsatisfied, oversatisfied: pool };
    }

    public costUnsatisfied(energy: EnergyCard[]): EnergyTypeDef[] {
        return this.analyzeCost(energy).unsatisfied;
    }

    public costSatisfied(energy: EnergyCard[]): boolean {
        return this.analyzeCost(energy).unsatisfied.length === 0;
    }

    public costOversatisfied(energy: EnergyCard[]): EnergyTypeDef[] {
        return this.analyzeCost(energy).oversatisfied;
    }

    public getDetails(): any[] {
        return [
            `[${this.cost.map(e => e.symbol).join("")}]`,
            this.name,
            this.damage || "",
            "<br />",
            this.text
        ];
    }
};
