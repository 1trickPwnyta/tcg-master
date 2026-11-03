import { IToken } from "../../../IToken.js";
import { EnergyType } from "../../EnergyType.js";
import { InterruptResolution } from "../../InterruptResolution.js";
import { CardDatabase } from "../CardDatabase.js";
import { EvolutionTree } from "../EvolutionTree.js";
import { AttackWorker } from "./AttackWorker.js";
import { CardWorker, PlayContext } from "./CardWorker.js";

export abstract class CardWorker_Pokemon extends CardWorker {
    public override readonly kind = "pokemon";
    public abstract readonly type: EnergyType;
    public abstract readonly stage: "basic" | "stage1" | "stage2";
    public abstract readonly evolutionTree: EvolutionTree;
    public abstract readonly hp: number;
    public abstract readonly attacks: AttackWorker[];
    public abstract readonly weakness: EnergyType | null;
    public abstract readonly retreatCost: number;

    public get token(): IToken {
        return { name: this.name, type: "pokemon" };
    }

    public override play(context: PlayContext): boolean {
        if (this.stage === "basic") {
            if (context.game.activePlayer.bench.cards.length >= 5) {
                context.game.sendError(context.player, "Your bench is full.");
                return false;
            } else {
                context.game.moveCard(context.card.id, context.player.hand.id, context.player.bench.id);
                context.game.send(context.player, "placed", context.card, "on", context.player.pronouns.possessive, "bench.");
                return true;
            }
        } else {
            const cards = [ ...context.player.active.cards, ...context.player.bench.cards ].filter(c => {
                const worker = CardDatabase.find<CardWorker_Pokemon>(c.dbid);
                return worker.evolutionTree.evolvesDirect(this.name);
            });
            if (cards.length) {
                context.game.interrupt({
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
            "Retreat:",
            ...Array.from({ length: this.retreatCost }, () => EnergyType.Colorless.symbol)
        ];
    }
};
