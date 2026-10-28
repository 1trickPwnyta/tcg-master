import { GameEngine } from "../engine/GameEngine.js";
import { CardState } from "../state/CardState.js";
import { GameState } from "../state/GameState.js";
import { CardWorker_Pokemon } from "./CardWorker_Pokemon.js";

export abstract class AttackWorker {
    public readonly dbid: string;
    public abstract readonly name: string;
    public abstract readonly damage: number;

    public constructor(parent: CardWorker_Pokemon, dbid: string) {
        this.dbid = `${parent.dbid}.${dbid}`;
    }

    public execute(context: AttackContext) {
        context.game.send(context.game.activePlayer, "'s", context.attacker, "used", this.name, "!");
        context.defender.damage += this.damage;
        context.game.send(context.game.inactivePlayer, "'s", context.defender, "took", { name: this.damage.toString(), type: "damage" }, "damage!");
        context.game.endTurn();
    }
};

export type AttackContext = {
    game: GameEngine,
    state: GameState,
    attacker: CardState,
    defender: CardState
};
