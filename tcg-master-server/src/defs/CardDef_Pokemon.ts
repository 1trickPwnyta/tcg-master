import { EnergyType } from "../game/EnergyType.js";
import { ICardDefData_Pokemon, IDefData } from "./IDefData.js";
import { CardDef } from "./CardDef.js";
import { IToken } from "../IToken.js";
import { Attack } from "./Attack.js";
import { PlayContext } from "../game/cards/workers/CardWorker.js";
import { DefDatabase } from "./DefDatabase.js";
import { EvolutionTree } from "../game/cards/EvolutionTree.js";
import { InterruptResolution } from "../game/state/interrupts/InterruptResolution.js";

export class CardDef_Pokemon extends CardDef {
    public override readonly name: string;
    public override readonly label: string;
    public override readonly kind = "pokemon";
    public readonly type: EnergyType;
    public readonly stage: "basic" | "stage1" | "stage2";
    public readonly evolutionTree: EvolutionTree;
    public readonly hp: number;
    public readonly weakness: EnergyType | undefined;
    public readonly resistance: EnergyType | undefined;
    public readonly retreat: number;
    public readonly attacks: Attack[];

    private readonly cardData: IDefData & ICardDefData_Pokemon;

    public constructor(data: IDefData) {
        super();
        this.cardData = data as IDefData & ICardDefData_Pokemon;
        this.name = this.cardData.name;
        this.label = this.cardData.label;
        this.type = EnergyType[this.cardData.type];
        this.stage = this.cardData.stage;
        this.evolutionTree = EvolutionTree[this.cardData.evolutionTree];
        this.hp = this.cardData.hp;
        this.weakness = this.cardData.weakness ? EnergyType[this.cardData.weakness] : undefined;
        this.resistance = this.cardData.resistance ? EnergyType[this.cardData.resistance] : undefined;
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
            if (context.game.players.active.bench.cards.length >= 5) {
                context.game.sendError(context.player, "Your bench is full.");
                return false;
            } else {
                context.game.cards.move(context.card.id, context.player.hand.id, context.player.bench.id);
                context.game.send(context.player, "placed", context.card, "on", context.player.pronouns.possessive, "bench.");
                return true;
            }
        } else {
            const cards = [ ...context.player.active.cards, ...context.player.bench.cards ].filter(c => {
                const def = DefDatabase.get<CardDef_Pokemon>(c.def);
                return def.evolutionTree.evolvesDirect(this.name);
            });
            if (cards.length) {
                context.game.interrupts.interrupt({
                    player: context.player.id,
                    prompt: `Which Pokémon will evolve into ${this.name}?`,
                    choices: cards.map(c => ({ text: c == context.player.active.cards[0] ? `${c.name} (active)` : c.name, target_id: c.id })),
                    resolution: InterruptResolution.Evolve,
                    args: [ context.card.id ]
                });
                return true;
            } else {
                context.game.sendError(context.player, "None of your Pokémon can evolve into", context.card, ".");
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
            ...Array.from({ length: this.retreat }, () => EnergyType.Colorless.symbol)
        ];
    }
};
