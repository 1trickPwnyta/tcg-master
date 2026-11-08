import { EnergyTypeDef } from "../../../defs/EnergyTypeDef.js";
import { GameEngine } from "../../engine/GameEngine.js";
import { CardState, CardStatus } from "../../state/CardState.js";
import { GameState } from "../../state/GameState.js";
import { Interrupt } from "../../state/interrupts/Interrupt.js";
import { CardDatabase } from "../CardDatabase.js";
import { CardWorker_Energy } from "./CardWorker_Energy.js";

export class AttackWorker {
    public readonly dbid: string;
    public readonly name: string;
    public cost: EnergyTypeDef[] = [];
    public damage: number = 0;
    public text: string | null = null;

    public canUse: (context: AttackContext) => boolean = () => true;
    public validateTargets: (context: AttackContext, ...targets: number[]) => Interrupt | null = () => null;
    public preEffects: ((context: AttackContext) => number)[] = [];
    public postEffects: ((context: AttackContext, knockedOut: boolean, ...targets: number[]) => void)[] = [];

    public constructor(dbid: string, name: string) {
        this.dbid = dbid;
        this.name = name;
    }

    public execute(context: AttackContext, ...targets: number[]): boolean {
        if (!this.costSatisfied(context.attacker.attachments.cards.map(c => CardDatabase.find<CardWorker_Energy>(c.def)))) {
            context.engine.sendError(context.engine.players.active, context.attacker, "doesn't have enough energy to use", this.name, ".");
            return false;
        } else {
            const interrupt = this.validateTargets(context, ...targets);
            if (interrupt) {
                context.engine.interrupts.interrupt(interrupt);
            } else {
                context.engine.send(context.engine.players.active, "'s", context.attacker, "used", this.name, "!");
                let damage = this.damage;
                if (context.defender.damagePrevention !== undefined) {
                    if (context.defender.damagePrevention < 0) {
                        damage = 0;
                    } else {
                        damage -= context.defender.damagePrevention;
                        damage = Math.max(0, damage);
                    }
                }
                const worker = CardDatabase.find<CardWorker_Pokemon>(context.attacker.def);
                for (const effect of this.preEffects) {
                    damage += effect(context);
                }
                const destinyBond = context.engine.pokemon.hasStatus(context.defender.id, CardStatus.GastlyDestinyBond);
                const knockedOut = context.engine.pokemon.damage({ owner_id: context.engine.players.inactive.id, card_id: context.defender.id, amount: damage, type: worker.type });
                for (const effect of this.postEffects) {
                    effect(context, knockedOut, ...targets);
                }
                if (knockedOut && destinyBond) {
                    context.engine.pokemon.knockOut(context.engine.players.active.id, context.attacker.id);
                }
                context.state.turn!.attacked = true;
            }
            return true;
        }
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

export type AttackContext = {
    engine: GameEngine,
    state: GameState,
    attack: string,
    attacker: CardState,
    defender: CardState
};
