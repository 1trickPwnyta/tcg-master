import { EnergyType } from "../EnergyType.js";
import { GameEngine } from "../engine/GameEngine.js";
import { CardState } from "../state/CardState.js";
import { GameState } from "../state/GameState.js";
import { CardDatabase } from "./CardDatabase.js";
import { CardWorker_Energy } from "./CardWorker_Energy.js";
import { CardWorker_Pokemon } from "./CardWorker_Pokemon.js";

export abstract class AttackWorker {
    public readonly dbid: string;
    public abstract readonly name: string;
    public abstract readonly cost: EnergyType[];
    public abstract readonly damage: number;

    public constructor(parent: CardWorker_Pokemon, dbid: string) {
        this.dbid = `${parent.dbid}.${dbid}`;
    }

    public execute(context: AttackContext): boolean {
        if (!this.costSatisfied(context.attacker.attachments.cards.map(c => CardDatabase.find<CardWorker_Energy>(c.dbid)))) {
            context.game.sendError(context.game.activePlayer, context.attacker, "doesn't have enough energy to use", this.name, ".");
            return false;
        } else {
            context.game.send(context.game.activePlayer, "'s", context.attacker, "used", this.name, "!");
            context.defender.damage += this.damage;
            context.game.send(context.game.inactivePlayer, "'s", context.defender, "took", { name: this.damage.toString(), type: "damage" }, "damage!");
            if (context.defender.damage >= CardDatabase.find<CardWorker_Pokemon>(context.defender.dbid).hp) {
                context.game.send(context.game.inactivePlayer, "'s", context.defender, "was knocked out!");
                context.game.inactivePlayer.active.cards.splice(0, 1);
                context.game.inactivePlayer.discard.cards.push(context.defender);
                context.game.takePrize(context.game.activePlayer.id);
            }
            context.state.turn!.attacked = true;
            return true;
        }
    }

    public costSatisfied(energy: CardWorker_Energy[]): boolean {
        const reqs = [ ...this.cost ].sort((a, b) => b.resolutionPriority - a.resolutionPriority);
        const pool = energy.flatMap(e => Array.from({ length: e.amount }, () => e.type)).sort((a, b) => a.resolutionPriority - b.resolutionPriority);
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
                return false;
            }
        }

        return true;
    }
};

export type AttackContext = {
    game: GameEngine,
    state: GameState,
    attacker: CardState,
    defender: CardState
};
