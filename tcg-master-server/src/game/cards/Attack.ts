import { Card_Pokemon } from "./Card_Pokemon.js";

export abstract class Attack {
    public abstract readonly name: string;
    public abstract readonly cost: number;
    public abstract readonly damage: number;
    public readonly text: string = "";

    public execute(attacker: Card_Pokemon, defender: Card_Pokemon) {
        attacker.game.send(attacker.owner, "'s", attacker, "used", this, "!");
        defender.damageCounters += this.damage / 10;
        this.effect(attacker, defender);
    }

    protected effect(_attacker: Card_Pokemon, _defender: Card_Pokemon) {
        return true;
    }

    public toString(): string {
        return this.name;
    }

    public getDetails(): string {
        return `[${this.cost}] ${this.name} [${this.damage ?? "-"}]
${this.text}
`;
    }
};
