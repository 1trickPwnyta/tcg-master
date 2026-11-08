import { EnergyType } from "../../../EnergyType.js";
import { InterruptResolution } from "../../../state/interrupts/InterruptResolution.js";
import { Card } from "../../CardDatabase.js";
import { EvolutionTree } from "../../EvolutionTree.js";
import { AttackFactory } from "../AttackFactory.js";
import { AttackContext } from "../AttackWorker.js";
import { CardWorker_Pokemon } from "../CardWorker_Pokemon.js";

@Card("BaseSet.Pidgey")
export class Card_Pokemon_BaseSet_Pidgey extends CardWorker_Pokemon {
    public override readonly name: string = "Pidgey";
    public override readonly type: EnergyType = EnergyType.Colorless;
    public override readonly stage = "basic";
    public override readonly evolutionTree: EvolutionTree = new EvolutionTree("Pidgey");
    public override readonly hp: number = 40;
    public override readonly weakness: EnergyType | null = EnergyType.Lightning;
    public override readonly resistance = EnergyType.Fighting;
    public override readonly retreatCost: number = 1;

    public override readonly attacks = [
        AttackFactory.makeAttack("BaseSet.Pidgey.Whirlwind", "Whirlwind")
            .costs(EnergyType.Colorless, EnergyType.Colorless)
            .deals(10)
            .reads("If your opponent has any Benched Pokémon, they choose 1 of them and switch it with the Defending Pokémon. <em>(Do the damage before switching the Pokémon.)</em>")
            .withPostEffect((context: AttackContext, knockedOut: boolean) => {
                if (!knockedOut && context.engine.players.inactive.bench.cards.length) {
                    context.engine.interrupts.interrupt({
                        player: context.engine.players.inactive.id,
                        prompt: "Choose one of your benched Pokémon to switch with your active Pokémon.",
                        choices: context.engine.players.inactive.bench.cards.map(c => ({ text: c.name, target_id: c.id })),
                        resolution: InterruptResolution.Promote,
                        args: [ context.engine.players.inactive.id ],
                        force: true
                    });
                }
            })
            .finalize()
    ];
};
