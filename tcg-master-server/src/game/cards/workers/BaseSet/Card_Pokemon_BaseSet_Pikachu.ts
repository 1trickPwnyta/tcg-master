import { EnergyType } from "../../../EnergyType.js";
import { Attack } from "../../Attack.js";
import { Card_Pokemon, EvolutionStage } from "../../Card_Pokemon.js";
import { EvolutionTree } from "../../EvolutionTree.js";

export class Card_Pokemon_BaseSet_Pikachu extends Card_Pokemon {
    public override readonly name: string = "Pikachu";
    public override readonly type: EnergyType = EnergyType.Lightning;
    public override readonly stage: EvolutionStage = EvolutionStage.Basic;
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Pikachu");
    public override readonly hp: number = 40;
    public override readonly attacks: Attack[] = [ new Attack_Gnaw(this), new Attack_ThunderJolt(this) ];
    public override readonly weakness: EnergyType | null = EnergyType.Fighting;
    public override readonly retreatCost: number = 1;
}

class Attack_Gnaw extends Attack {
    public override readonly name: string = "Gnaw";
    public override readonly cost: EnergyType[] = [ EnergyType.Colorless ];
    public override readonly damage: number = 10;
}

class Attack_ThunderJolt extends Attack {
    public override readonly name: string = "Thunder Jolt";
    public override readonly cost: EnergyType[] = [ EnergyType.Lightning, EnergyType.Colorless ];
    public override readonly damage: number = 30;
    public override readonly text: string = "Flip a coin. If tails, Pikachu does 10 damage to itself.";

    protected override postEffect(attacker: Card_Pokemon, _defender: Card_Pokemon): void {
        if (!this.owner.flipCoin()) {
            attacker.takeDamage(10, EnergyType.Colorless);
        }
    }
}
