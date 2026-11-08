import path from "path";
import { AttackContext, AttackWorker } from "../game/attacks/AttackWorker.js";
import { IAttackData } from "./IDefData.js";
import { pathToFileURL } from "url";
import { Interrupt } from "../game/state/interrupts/Interrupt.js";
import { PokemonCardDef } from "./PokemonCardDef.js";
import { DefDatabase } from "./DefDatabase.js";
import { EnergyTypeDef } from "./EnergyTypeDef.js";
import { EnergyCardDef } from "./EnergyCardDef.js";
import { StatusDef } from "./StatusDef.js";

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
            const def = DefDatabase.get<StatusDef>(status);
            if (!def.worker.try_attack({
                engine: context.engine,
                owner_id: context.engine.players.active.id,
                card_id: context.attacker.id
            }, context)) {
                failToStatus = true;
                break;
            }
        }

        if (!failToStatus) {
            context.engine.send(context.engine.players.active, "'s", context.attacker, "used", this.name, "!");
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

            damage = this.preEffects(context, damage);

            const def = DefDatabase.get<PokemonCardDef>(context.attacker.def);
            const knockedOut = context.engine.pokemon.damage({
                owner_id: context.engine.players.inactive.id,
                card_id: context.defender.id,
                amount: damage,
                attacker_id: context.attacker.id,
                type: def.type
            });
            
            this.postEffects(context, knockedOut, ...targets);
        }

        context.engine.state.turn!.attacked = true;

        return true;
    }

    private analyzeCost(energy: EnergyCardDef[]): { unsatisfied: EnergyTypeDef[], oversatisfied: EnergyTypeDef[] } {
        const reqs = [ ...this.cost ].sort((a, b) => b.resolutionPriority - a.resolutionPriority);
        const pool = energy.flatMap(e => Array.from({ length: e.amount }, () => e.type)).sort((a, b) => a.resolutionPriority - b.resolutionPriority);
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

    public costUnsatisfied(energy: EnergyCardDef[]): EnergyTypeDef[] {
        return this.analyzeCost(energy).unsatisfied;
    }

    public costSatisfied(energy: EnergyCardDef[]): boolean {
        return this.analyzeCost(energy).unsatisfied.length === 0;
    }

    public costOversatisfied(energy: EnergyCardDef[]): EnergyTypeDef[] {
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
