import { EnergyType } from "../game/EnergyType.js";
import { ICardDefData_Energy, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import { IToken } from "../IToken.js";
import { PlayContext } from "../game/cards/workers/CardWorker.js";
import { InterruptResolution } from "../game/state/interrupts/InterruptResolution.js";

export class CardDef_Energy extends CardDef {
    public override readonly name: string;
    public override readonly label: string;
    public override readonly kind = "energy";
    public readonly basic: boolean;
    public readonly type: EnergyType;
    public readonly amount: number;
    public readonly text?: string;

    private readonly cardData: IDefData & ICardDefData_Energy;

    public override get token(): IToken {
        let symbol = "";
        for (let i = 0; i < this.amount; i++) {
            symbol += this.type.symbol;
        }
        return { name: `${symbol}${this.basic ? "Energy" : this.name}`, type: "energy" };
    }

    public constructor(data: IDefData) {
        super();
        this.cardData = data as IDefData & ICardDefData_Energy;
        this.name = this.cardData.name;
        this.label = this.cardData.label;
        this.basic = this.cardData.basic;
        this.type = EnergyType[this.cardData.type];
        this.amount = this.cardData.amount;
        this.text = this.cardData.text;
    }

    public override async init() { }

    public override play(context: PlayContext): boolean {
        if (context.state.turn?.energyPlayed) {
            context.game.sendError(context.game.players.active, "You already played an Energy card this turn.");
            return false;
        }
        
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
