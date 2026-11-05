import { EnergyType } from "../../../EnergyType.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Nidoran♂")
export class Card_Pokemon_BaseSet_NidoranMale extends CardWorker_Pokemon {
    public override readonly name: string = "Nidoran ♂";
    public override readonly type: EnergyType = EnergyType.Grass;
    public override readonly stage = "basic";
    public override readonly evolutionTree = new EvolutionTree("Nidoran ♂");
    public override readonly hp: number = 40;
    public override readonly weakness = EnergyType.Psychic;
    public override readonly resistance = null;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Nidoran♂.HornHazard", "Horn Hazard")
            .costs(EnergyType.Grass)
            .deals(30)
            .reads("Flip a coin. If tails, this attack does nothing.")
            .withPreEffect((context: AttackContext) => {
                if (!context.game.flipCoin(context.game.players.active.id)) {
                    return -30;
                } else {
                    return 0;
                }
            })
            .finalize()
    ];
};
