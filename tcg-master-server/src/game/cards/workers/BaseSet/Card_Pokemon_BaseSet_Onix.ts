import { EnergyType } from "../../../EnergyType.js";
import { InterruptResolution } from "../../../state/interrupts/InterruptResolution.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Onix")
export class Card_Pokemon_BaseSet_Onix extends CardWorker_Pokemon {
    public override readonly name: string = "Onix";
    public override readonly type: EnergyType = EnergyType.Fighting;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Onix");
    public override readonly hp: number = 90;
    public override readonly weakness = EnergyType.Grass;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 3;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Onix.RockThrow", "Rock Throw")
            .costs(EnergyType.Fighting)
            .deals(10)
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Onix.Harden", "Harden")
            .costs(EnergyType.Fighting, EnergyType.Fighting)
            .reads("During your opponent's next turn, whenever 30 or less damage is done to Onix <em>(after applying Weakness and Resistance)</em>, prevent that damage. <em>(Any other effects of attacks still happen.)</em>")
            .withPostEffect((context: AttackContext) => {
                context.attacker.damageThreshold = 40;
            })
            .finalize()
    ];
};
