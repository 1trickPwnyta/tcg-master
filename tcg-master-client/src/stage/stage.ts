import $ from "jquery";
import { Vector } from "./math";
import type { PokemonCardState, State } from "./state";
import { Card, PokemonCard } from "./cards";
import { StageObject } from "./object";

export const STAGE_SIZE = new Vector(600, 600);
export const CARD_SIZE = new Vector(72, 99);

const ACTIVE_POSITION = new Vector(STAGE_SIZE.x / 2, STAGE_SIZE.y * 2 / 3);
const BENCH_POSITION = new Vector(STAGE_SIZE.x / 2, STAGE_SIZE.y * 9 / 10);
const BENCH_OFFSET = STAGE_SIZE.x / 7;

export enum Perspective {
    Favoring,
    Opposing
};

export type StageEvent = { type: string, args: any };

export class Stage {
    private _state?: State;
    private cards: Card[] = [];
    private freeze: boolean = false;

    public get state(): State | undefined {
        return this._state;
    }

    public get element(): JQuery<HTMLElement> {
        return $("#stage");
    }

    public getCard(id: number): Card {
        return this.cards.find(c => c.id === id)!;
    }

    public addCard(card: Card) {
        this.cards.push(card);
    }

    public removeCard(card: Card) {
        this.cards.splice(this.cards.findIndex(c => c.id === card.id), 1);
    }

    public update(state: State) {
        this._state = state;
        this.draw();
    }

    public handleEvent(event: StageEvent, callback: () => void) {
        switch (event.type) {
            case "damage": this.handleDamageEvent(event.args, callback); break;
            default: console.error(`Attempted to process unknown event type: ${event.type}`);
        }
    }

    private handleDamageEvent(args: any, callback: () => void) {
        const card = this.getCard(args.receiver) as PokemonCard;
        const effect = new StageObject(this, "damage");
        effect.position = card.position;
        effect.perspective = card.perspective;
        effect.neverFlip = true;
        effect.draw();
        effect.element.on("animationend", () => effect.remove());
        setTimeout(() => {
            const number = new StageObject(this, "damage-number");
            number.element.text(args.amount.toString());
            number.position = card.position;
            number.perspective = card.perspective;
            number.neverFlip = true;
            number.draw();
            setTimeout(() => {
                card.damage += args.amount;
                card.draw();
                number.element.fadeOut(500, function() { number.remove(); });
                callback();
            }, 1500);
        }, 200);
    }

    private draw() {
        if (this.freeze) return;

        const stage = $("#stage");
        stage.html("");
        this.cards = [];
        
        if (this.state) {
            this.drawPlayer(stage, Perspective.Favoring, this.state.self.active, this.state.self.bench);
            this.drawPlayer(stage, Perspective.Opposing, this.state.opponent.active, this.state.opponent.bench);
        }
    }

    private drawPlayer(stage: JQuery<HTMLElement>, perspective: Perspective, active: PokemonCardState | undefined, bench: PokemonCardState[]) {
        if (active) {
            const card = new PokemonCard(this, active);
            card.position = ACTIVE_POSITION;
            card.perspective = perspective;
            card.draw();
        }

        let benchPosition = BENCH_POSITION.translate(-(bench.length - 1) * BENCH_OFFSET / 2, 0);
        for (let i = 0; i < bench.length; i++) {
            const card = new PokemonCard(this, bench[i]);
            card.position = benchPosition;
            card.perspective = perspective;
            card.draw();
            benchPosition = benchPosition.translate(BENCH_OFFSET, 0);
        }
    }
};
