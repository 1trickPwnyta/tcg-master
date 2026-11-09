import path from "path";
import { AttackContext, AttackWorker } from "../game/attacks/AttackWorker.js";
import { IAttackData } from "./IDefData.js";
import { pathToFileURL } from "url";
import { Interrupt } from "../game/state/interrupts/Interrupt.js";
import { DefDatabase } from "./DefDatabase.js";
import { EnergyTypeDef } from "./EnergyTypeDef.js";
import { EnergyCard } from "../game/state/EnergyCard.js";

const __dirname = import.meta.dirname;

export class Attack {
    public readonly name: string;
    public readonly cost: EnergyTypeDef[];
    public readonly damage: number;
    public readonly text?: string;
    public readonly workers: AttackWorker[];

    private readonly attackData: IAttackData;

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
                const fullName = path.join(__dirname, "..", "game", "attacks", `${workerClass}.ts`);
                const module = await import(pathToFileURL(fullName).href);
                const workerConstructor = module[workerClass];
                const worker = new workerConstructor(workerArgs);
                this.workers.push(worker);
            }
        }
    }

    private validateTargets(context: AttackContext, ...targets: number[]): Interrupt | null {
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

    private postEffects(context: AttackContext, knockedOut: boolean, ...targets: number[]) {
        for (const worker of this.workers) {
            worker.postEffect(context, knockedOut, ...targets);
        }
    }

    public execute(context: AttackContext, ...targets: number[]): boolean {
        const interrupt = this.validateTargets(context, ...targets);
        if (interrupt) {
            context.engine.interrupts.interrupt(interrupt);
            return true;
        }

        let failToStatus = false;
        for (const status of context.attacker.status) {
            if (!status.def.worker.try_attack({
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

            // Have a status worker
            if (context.defender.damagePrevention !== undefined) {
                if (context.defender.damagePrevention < 0) {
                    damage = 0;
                } else {
                    damage -= context.defender.damagePrevention;
                    damage = Math.max(0, damage);
                }
            }

            for (const status of context.attacker.status) {
                damage = status.def.worker.modify_damage_dealt({
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
