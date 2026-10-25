import { EnergyType } from "../EnergyType.js";
import { Game, GamePhase } from "../Game.js";
import { Player } from "../Player.js";
import { Card } from "./Card.js";
import { Card_Energy } from "./Card_Energy.js";
import { Card_Pokemon } from "./Card_Pokemon.js";
import { TargetSelector } from "./TargetSelector.js";

export abstract class Attack {
    protected readonly parent: Card_Pokemon;
    public abstract readonly name: string;
    public abstract readonly cost: EnergyType[];
    public abstract readonly damage: number;
    public readonly text: string = "";
    protected readonly targetSelector: TargetSelector<Card> | undefined;

    public constructor(parent: Card_Pokemon) {
        this.parent = parent;
    }

    public get game(): Game {
        return this.parent.game;
    }

    public get owner(): Player {
        return this.parent.owner;
    }

    public get player(): Player {
        return this.owner;
    }

    public costSatisfied(energy: Card_Energy[]): boolean {
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

    public use(attacker: Card_Pokemon, defender: Card_Pokemon) {
        if (this.targetSelector) {
            this.targetSelector.selectTarget();
        } else {
            this.execute(attacker, defender);
        }
    }

    public execute(...targets: Card[]) {
        this.game.send(this.owner, "'s", this.owner.active.single, "used", this, "!");
        const damageOffset = this.preEffect(...targets);
        this.owner.opponent.active.single?.takeDamage(this.damage + damageOffset, this.parent.type);
        this.postEffect(...targets);
        this.game.setPhase(GamePhase.Between);
        this.game.update();
    }

    public cancel(): boolean {
        return false;
    }

    protected preEffect(..._targets: Card[]): number {
        return 0;
    }

    protected postEffect(..._targets: Card[]) { }

    public toString(): string {
        return this.name;
    }

    public getDetails(): string {
        return `[${this.cost.map(e => e.symbol)}] ${this.name} [${this.damage ?? "-"}]
${this.text}
`;
    }
};
