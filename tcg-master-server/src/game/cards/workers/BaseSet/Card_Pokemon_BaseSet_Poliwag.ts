import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Poliwag")
export class Card_Pokemon_BaseSet_Poliwag extends CardWorker_Pokemon {
    public override readonly name: string = "Poliwag";
    public override readonly type: EnergyType = EnergyType.Water;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Poliwag");
    public override readonly hp: number = 40;
    public override readonly weakness: EnergyType | null = EnergyType.Grass;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Poliwag.WaterGun", "Water Gun")
            .costs(EnergyType.Water)
            .deals(10)
            .reads(`Does 10 damage plus 10 more damage for each ${EnergyType.Water.symbol} Energy attached to Poliwag but not used to pay for this attack's Energy cost. Extra ${EnergyType.Water.symbol} Energy after the 2nd don't count.`)
            .withPreEffect(context => {
                const extraEnergy = context.attack.costOversatisfied(context.game.pokemon.getEnergy(context.attacker.id).map(e => e.worker));
                const extraDamage = Math.min(20, extraEnergy.filter(e => e === EnergyType.Water).length * 10);
                return extraDamage;
            })
            .finalize()
    ];
};
