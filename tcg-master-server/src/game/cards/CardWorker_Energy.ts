import { IToken } from "../../IToken.js";
import { EnergyType } from "../EnergyType.js";
import { InterruptResolution } from "../InterruptResolution.js";
import { CardWorker, PlayContext } from "./CardWorker.js";

export abstract class CardWorker_Energy extends CardWorker {
    public abstract readonly type: EnergyType;
    public abstract readonly basic: boolean;
    public readonly amount: number = 1;

    public get token(): IToken {
        let symbol = "";
        for (let i = 0; i < this.amount; i++) {
            symbol += this.type.symbol;
        }
        return { name: `${symbol}${this.basic ? "Energy" : this.name}`, type: "energy" };
    }

    public override play(context: PlayContext) {
        if (context.state.turn?.energyPlayed) {
            context.game.send("You already played an Energy card this turn.");
        } else {
            context.game.interrupt({
                player: context.game.activePlayer.id,
                prompt: `Attach ${context.card.name} to which Pokémon?`,
                choices: [ context.game.activePlayer.active.cards[0], ...context.game.activePlayer.bench.cards ].map(c => ({
                    text: c.name + (c == context.game.activePlayer.active.cards[0] ? " (active)" : ""),
                    target_id: c.id
                })),
                resolution: InterruptResolution.AttachEnergy,
                args: [ context.card.id ]
            });
        }
    }
};
