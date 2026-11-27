import $ from "jquery";
import { Gameplay } from "../gameplay";
import { Vector } from "./math";
import { StageObject } from "./object";
import { CARD_SIZE, Stage } from "./stage";
import type { CardState, PokemonCardState } from "./state";

const CARD_OFFSET = 15;
const CARD_ZINDEX = 100;

export class Card extends StageObject {
    public readonly id: number;
    private readonly _state: CardState;

    public get state(): CardState {
        return this._state;
    }

    public constructor(stage: Stage, state: CardState) {
        super(stage, "card");
        this.id = state.id;
        this._state = state;
        this.element.css({
            width: `${CARD_SIZE.x}px`,
            height: `${CARD_SIZE.y}px`
        })
        const innerElement = $("<div>");
        innerElement.css({
            width: `${CARD_SIZE.x}px`,
            height: `${CARD_SIZE.y}px`,
            backgroundImage: `url("/card-images/${state.graphicPath}")`
        });
        innerElement.on("mouseover", () => Gameplay.instance.showcase(state.graphicPath));
        innerElement.css({ zIndex: CARD_ZINDEX });
        this.element.append(innerElement);
        this.stage.addCard(this);
    }

    public override remove() {
        super.remove();
        this.stage.removeCard(this);
    }
}

export class PokemonCard extends Card {
    public damage: number;
    private attachments: Card[];
    private damageCounters: StageObject;

    public override get state(): PokemonCardState {
        return super.state as PokemonCardState;
    }

    public constructor(stage: Stage, state: PokemonCardState) {
        super(stage, state);
        this.damage = state.damage;
        this.damageCounters = new StageObject(stage, "damage-counters");
        this.damageCounters.neverFlip = true;
        this.damageCounters.element.css({ visibility: "hidden" });
        this.attachments = state.attachments.cards.map(c => new Card(stage, c));
        for (let i = this.attachments.length - 1; i >= 0; i--) {
            this.element.append(this.attachments[i].element);
            this.attachments[i].position = new Vector(CARD_SIZE.x / 2, CARD_SIZE.y / 2 - CARD_OFFSET * (i + 1));
            this.attachments[i].perspective = this.perspective;
            this.attachments[i].element.css({ zIndex: CARD_ZINDEX - 1 - i });
            this.attachments[i].draw();
        }
    }

    public override draw() {
        super.draw();
        if (this.damage) {
            this.damageCounters.position = this.position.translate(CARD_SIZE.x / 2, -(CARD_SIZE.y / 4));
            this.damageCounters.perspective = this.perspective;
            this.damageCounters.element.text(this.damage.toString());
            this.damageCounters.element.css({ visibility: "visible" });
            this.damageCounters.draw();
        } else {
            this.damageCounters.element.css({ visibility: "hidden" });
        }
    }
};
