import { CardOrientation } from "../../CardOrientation.js";
import { EnergyType } from "../../EnergyType.js";
import { Attack } from "../Attack.js";
import { Card_Pokemon, EvolutionStage } from "../Card_Pokemon.js";
import { EvolutionTree } from "../EvolutionTree.js";

export class Card_Pokemon_BaseSet_Squirtle extends Card_Pokemon {
    public override readonly name: string = "Squirtle";
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly stage: EvolutionStage = EvolutionStage.Basic;
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Squirtle");
    public override readonly hp: number = 40;
    public override readonly attacks: Attack[] = [ new Attack_Bubble(this), new Attack_Withdraw(this) ];
    public override readonly weakness: EnergyType | null = EnergyType.Lightning;
    public override readonly retreatCost: number = 1;
}

class Attack_Bubble extends Attack {
    public override readonly name: string = "Bubble";
    public override readonly cost: EnergyType[] = [ EnergyType.Water ];
    public override readonly damage: number = 10;
    public override readonly text: string = "Flip a coin. If heads, the Defending Pokémon is now Paralyzed.";

    protected override postEffect(_attacker: Card_Pokemon, defender: Card_Pokemon) {
        if (defender.inPlay && this.owner.flipCoin()) {
            defender.orientation = CardOrientation.Paralyzed;
        }
    }
}

class Attack_Withdraw extends Attack {
    public override readonly name: string = "Withdraw";
    public override readonly cost: EnergyType[] = [ EnergyType.Water, EnergyType.Colorless ];
    public override readonly damage: number = 0;
    public override readonly text: string = "Flip a coin. If heads, prevent all damage done to Squirtle during your opponent's next turn. <em>(Any other effects of attacks still happen.)</em>";

    protected override postEffect(attacker: Card_Pokemon, _defender: Card_Pokemon) {
        if (this.owner.flipCoin()) {
            attacker.preventDamage();
        }
    }
}
