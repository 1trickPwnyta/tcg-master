import { EnergyType } from "../../../EnergyType.js";
import { InterruptResolution } from "../../../state/interrupts/InterruptResolution.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Ninetales")
export class Card_Pokemon_BaseSet_Ninetales extends CardWorker_Pokemon {
    public override readonly name: string = "Ninetales";
    public override readonly type: EnergyType = EnergyType.Fire;
    public override readonly stage = "stage1";
    public override readonly evolutionTree: EvolutionTree = EvolutionTree.Vulpix;
    public override readonly hp: number = 80;
    public override readonly weakness: EnergyType | null = EnergyType.Water;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Ninetales.Lure", "Lure")
            .costs(EnergyType.Colorless, EnergyType.Colorless)
            .reads("If your opponent has any Benched Pokémon, choose 1 of them and switch it with their Active Pokémon.")
            .targets((context: AttackContext, benched_id?: number) => benched_id === undefined && context.game.players.inactive.bench.cards.length ? {
                    player: context.game.players.active.id,
                    prompt: "Which Pokémon will be lured out?",
                    choices: context.game.players.inactive.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                    resolution: InterruptResolution.AttackTargets,
                    args: [ this.dbid ]
                } : null
            )
            .withPostEffect((context: AttackContext, _knockedOut: boolean, benched_id?: number) => {
                console.log(benched_id);
                if (benched_id !== undefined) {
                    context.game.cards.move(context.game.players.inactive.active.cards[0].id, context.game.players.inactive.active.id, context.game.players.inactive.bench.id);
                    context.game.cards.move(benched_id, context.game.players.inactive.bench.id, context.game.players.inactive.active.id);
                    context.game.send(context.game.search.getCard(benched_id), "was lured out!");
                }
            })
            .finalize(),
        AttackFactory.makeAttack("BaseSet.Ninetales.FireBlast", "Fire Blast")
            .costs(EnergyType.Fire, EnergyType.Fire, EnergyType.Fire, EnergyType.Fire)
            .deals(80)
            .reads(`Discard 1 ${EnergyType.Fire} Energy card attached to Ninetales in order to use this attack.`)
            .discards(1, EnergyType.Fire)
            .finalize()
    ];
};
