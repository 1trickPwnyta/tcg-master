import { Gameplay } from "../gameplay";
import { Vector } from "./math";
import { StageObject } from "./object";
import { CARD_SIZE, Perspective } from "./stage";
import type { CardState, PokemonCardState } from "./state";

const CARD_OFFSET = 15;

export class Card extends StageObject {
    public constructor(state: CardState) {
        super("card");
        this.element.css({
            width: `${CARD_SIZE.x}px`,
            height: `${CARD_SIZE.y}px`,
            backgroundImage: `url("/card-images/${state.graphicPath}")`
        });
        this.element.on("mouseover", () => Gameplay.instance.showcase(state.graphicPath));
    }
}

export class PokemonCard extends Card {
    private damage: number;
    private attachments: Card[];

    public constructor(state: PokemonCardState) {
        super(state);
        this.damage = state.damage;
        this.attachments = state.attachments.cards.map(c => new Card(c));
    }

    public override draw(stage: JQuery<HTMLElement>, position: Vector, perspective: Perspective) {
        for (let i = this.attachments.length - 1; i >= 0; i--) {
            this.attachments[i].draw(stage, position.translate(0, -CARD_OFFSET * (i + 1)), perspective);
        }
        super.draw(stage, position, perspective);
        if (this.damage) {
            const damage = new StageObject("damage-counters");
            damage.element.text(this.damage.toString());
            damage.draw(stage, position.translate(25, -35), Perspective.Favoring);
        }
    }
};
