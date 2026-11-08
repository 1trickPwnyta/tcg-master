import { ICardDefData_Pokemon, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import { Attack } from "./Attack.js";
import { PlayContext } from "../game/cards/workers/CardWorker.js";
import { DefDatabase } from "./DefDatabase.js";
import { InterruptResolution } from "../game/state/interrupts/InterruptResolution.js";
import { EnergyTypeDef } from "./EnergyTypeDef.js";
import { EnergyTypeDefOf } from "./defof/EnergyTypeDefOf.js";
import { EvolutionDef } from "./EvolutionDef.js";

export class PokemonCardDef extends CardDef {
    public override readonly kind = "pokemon";
    public readonly type: EnergyTypeDef;
    public readonly stage: "basic" | "stage1" | "stage2";
    public readonly evolution: EvolutionDef | null;
    public readonly hp: number;
    public readonly weakness: EnergyTypeDef | undefined;
    public readonly resistance: EnergyTypeDef | undefined;
    public readonly retreat: number;
    public readonly attacks: Attack[];

    private readonly cardData: IDefData & ICardDefData_Pokemon;

    public constructor(data: IDefData) {
        super(data);
        this.cardData = data as IDefData & ICardDefData_Pokemon;
        this.type = DefDatabase.get<EnergyTypeDef>(this.cardData.type);
        this.stage = this.cardData.stage;
        this.evolution = DefDatabase.get<EvolutionDef>(this.cardData.name);
        this.hp = this.cardData.hp;
        this.weakness = this.cardData.weakness ? DefDatabase.get<EnergyTypeDef>(this.cardData.weakness) : undefined;
        this.resistance = this.cardData.resistance ? DefDatabase.get<EnergyTypeDef>(this.cardData.resistance) : undefined;
        this.retreat = this.cardData.retreat;
        this.attacks = [];
    }

    public override async init() {
        for (const attackData of this.cardData.attacks) {
            const attack = new Attack(attackData);
            await attack.init();
            this.attacks.push(attack);
        }
    }

    public override play(context: PlayContext): boolean {
        if (this.stage === "basic") {
            if (context.engine.players.active.bench.cards.length >= 5) {
                context.engine.sendError(context.player, "Your bench is full.");
                return false;
            } else {
                context.engine.cards.move(context.card.id, context.player.hand.id, context.player.bench.id);
                context.engine.send(context.player, "placed", context.card, "on", context.player.pronouns.possessive, "bench.");
                return true;
            }
        } else {
            const cards = [ ...context.player.active.cards, ...context.player.bench.cards ].filter(c => {
                const def = DefDatabase.get<PokemonCardDef>(c.def);
                return def.evolution?.evolvesDirect(this.name);
            });
            if (cards.length) {
                context.engine.interrupts.interrupt({
                    player: context.player.id,
                    prompt: `Which Pokémon will evolve into ${this.name}?`,
                    choices: cards.map(c => ({ text: c == context.player.active.cards[0] ? `${c.name} (active)` : c.name, target_id: c.id })),
                    resolution: InterruptResolution.Evolve,
                    args: [ context.card.id ]
                });
                return true;
            } else {
                context.engine.sendError(context.player, "None of your Pokémon can evolve into", context.card, ".");
                return false;
            }
        }
    }

    public override getDetails(): any[] {
        return [
            this.name,
            `(${this.stage})`,
            this.type.symbol,
            "<br />",
            ...this.attacks.flatMap(a => [ ...a.getDetails(), ...(this.attacks.indexOf(a) !== this.attacks.length - 1 ? [ "<br />" ] : []) ]),
            "<br />",
            "Weakness:",
            this.weakness?.symbol,
            "Resistance:",
            this.resistance ? `${this.resistance}-30` : "",
            "Retreat:",
            ...Array.from({ length: this.retreat }, () => EnergyTypeDefOf.Colorless.symbol)
        ];
    }
};
