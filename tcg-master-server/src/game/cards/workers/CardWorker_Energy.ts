import { IToken } from "../../../IToken.js";
import { EnergyType } from "../../EnergyType.js";
import { InterruptResolution } from "../../state/interrupts/InterruptResolution.js";
import { InterruptType } from "../../state/interrupts/InterruptType.js";
import { CardWorker, PlayContext } from "./CardWorker.js";

export abstract class CardWorker_Energy extends CardWorker {
    public override readonly kind = "energy";
    public abstract readonly type: EnergyType;
    public abstract readonly basic: boolean;
    public readonly amount: number = 1;
    public abstract readonly text: string | null;

    public get token(): IToken {
        let symbol = "";
        for (let i = 0; i < this.amount; i++) {
            symbol += this.type.symbol;
        }
        return { name: `${symbol}${this.basic ? "Energy" : this.name}`, type: "energy" };
    }

    public override play(context: PlayContext): boolean {
        if (context.state.turn?.energyPlayed) {
            context.game.sendError(context.game.players.active, "You already played an Energy card this turn.");
            return false;
        } else {
            context.game.interrupts.interrupt({
                player: context.game.players.active.id,
                prompt: `Attach ${context.card.name} to which Pokémon?`,
                choices: [ context.game.players.active.active.cards[0], ...context.game.players.active.bench.cards ].map(c => ({
                    text: c.name + (c == context.game.players.active.active.cards[0] ? " (active)" : ""),
                    target_id: c.id
                })),
                resolution: InterruptResolution.AttachEnergy,
                args: [ context.card.id ]
            });
            return true;
        }
    }

    public override getDetails(): any[] {
        return [
            this.name,
            ...(this.basic ? [ "(basic)" ] : []),
            "Provides",
            Array.from({ length: this.amount }, () => this.type.symbol),
            ...(this.text ? [ "<br />", this.text ] : [])
        ];
    }
};
