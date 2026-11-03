import { EnergyType } from "../../EnergyType.js";
import { GameEngine } from "../../engine/GameEngine.js";
import { CardState } from "../../state/CardState.js";
import { GameState } from "../../state/GameState.js";
import { Interrupt } from "../../state/Interrupt.js";
import { CardDatabase } from "../CardDatabase.js";
import { CardWorker_Energy } from "./CardWorker_Energy.js";

export class AttackWorker {
    public readonly dbid: string;
    public readonly name: string;
    public cost: EnergyType[] = [];
    public damage: number = 0;
    public text: string | null = null;

    public canUse: (context: AttackContext) => boolean = () => true;
    public validateTargets: (context: AttackContext, ...targets: number[]) => Interrupt | null = () => null;
    public postEffects: ((context: AttackContext, knockedOut: boolean, ...targets: number[]) => void)[] = [];

    public constructor(dbid: string, name: string) {
        this.dbid = dbid;
        this.name = name;
    }

    public execute(context: AttackContext, ...targets: number[]): boolean {
        if (!this.costSatisfied(context.attacker.attachments.cards.map(c => CardDatabase.find<CardWorker_Energy>(c.dbid)))) {
            context.game.sendError(context.game.activePlayer, context.attacker, "doesn't have enough energy to use", this.name, ".");
            return false;
        } else {
            const interrupt = this.validateTargets(context, ...targets);
            if (interrupt) {
                context.game.interrupt(interrupt);
            } else {
                context.game.send(context.game.activePlayer, "'s", context.attacker, "used", this.name, "!");
                let damage = this.damage;
                if (context.defender.damagePrevention !== undefined) {
                    if (context.defender.damagePrevention < 0) {
                        damage = 0;
                    } else {
                        damage -= context.defender.damagePrevention;
                        damage = Math.max(0, damage);
                    }
                }
                const knockedOut = context.game.damagePokemon(context.game.inactivePlayer.id, context.defender.id, damage);
                for (const effect of this.postEffects) {
                    effect(context, knockedOut, ...targets);
                }
                context.state.turn!.attacked = true;
            }
            return true;
        }
    }

    public costUnsatisfied(energy: CardWorker_Energy[]): EnergyType[] {
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

        return unsatisfied;
    }

    public costSatisfied(energy: CardWorker_Energy[]): boolean {
        return this.costUnsatisfied(energy).length === 0;
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
    game: GameEngine,
    state: GameState,
    attacker: CardState,
    defender: CardState
};
