import path from "path";
import { AttackWorker } from "../game/attacks/AttackWorker.js";
import { EnergyType } from "../game/EnergyType.js";
import { GameEngine } from "../game/engine/GameEngine.js";
import { CardState, CardStatus } from "../game/state/CardState.js";
import { GameState } from "../game/state/GameState.js";
import { IAttackData } from "./IDefData.js";
import { pathToFileURL } from "url";
import { Interrupt } from "../game/state/interrupts/Interrupt.js";
import { CardDef_Pokemon } from "./CardDef_Pokemon.js";
import { DefDatabase } from "./DefDatabase.js";
import { CardWorker_Energy } from "../game/cards/workers/CardWorker_Energy.js";

const __dirname = import.meta.dirname;

export type AttackContext = {
    game: GameEngine,
    state: GameState,
    attacker: CardState,
    defender: CardState
};

export class Attack {
    public readonly name: string;
    public readonly cost: EnergyType[];
    public readonly damage: number;
    public readonly text?: string;
    public readonly workers: AttackWorker[];

    private readonly attackData: IAttackData;

    public constructor(data: IAttackData) {
        this.attackData = data;
        this.name = this.attackData.name;
        this.cost = this.attackData.cost.map(c => EnergyType[c]);
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
        if (!this.costSatisfied(context.game.pokemon.getEnergy(context.attacker.id).map(e => e.def))) {
            context.game.sendError(context.game.players.active, context.attacker, "doesn't have enough energy to use", this.name, ".");
            return false;
        }

        const interrupt = this.validateTargets(context, ...targets);
        if (interrupt) {
            context.game.interrupts.interrupt(interrupt);
            return true;
        }

        context.game.send(context.game.players.active, "'s", context.attacker, "used", this.name, "!");
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

        // Have a status worker
        const destinyBond = context.game.pokemon.hasStatus(context.defender.id, CardStatus.GastlyDestinyBond);
        
        const def = DefDatabase.get<CardDef_Pokemon>(context.attacker.def);
        const knockedOut = context.game.pokemon.damage({ owner_id: context.game.players.inactive.id, card_id: context.defender.id, amount: damage, type: def.type });
        
        this.postEffects(context, knockedOut, ...targets);

        // Have a status worker
        if (knockedOut && destinyBond) {
            context.game.pokemon.knockOut(context.game.players.active.id, context.attacker.id);
        }

        context.state.turn!.attacked = true;

        return true;
    }

    private analyzeCost(energy: CardWorker_Energy[]): { unsatisfied: EnergyType[], oversatisfied: EnergyType[] } {
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

    public costUnsatisfied(energy: CardWorker_Energy[]): EnergyType[] {
        return this.analyzeCost(energy).unsatisfied;
    }

    public costSatisfied(energy: CardWorker_Energy[]): boolean {
        return this.analyzeCost(energy).unsatisfied.length === 0;
    }

    public costOversatisfied(energy: CardWorker_Energy[]): EnergyType[] {
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
