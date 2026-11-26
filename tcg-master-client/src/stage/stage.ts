import $ from "jquery";
import { Vector } from "./math";
import type { PokemonCardState, State } from "./state";
import { Card, PokemonCard } from "./cards";
import { EventHandler } from "./events/EventHandler";
import { EventHandler_CardMove } from "./events/EventHandler_CardMove";
import { EventHandler_Damage } from "./events/EventHandler_Damage";
import { EventHandler_Attack } from "./events/EventHandler_Attack";
import { EventHandler_CoinFlip } from "./events/EventHandler_CoinFlip";
import { EventHandler_Banner } from "./events/EventHandler_Banner";
import type { StageObject } from "./object";

export const STAGE_SIZE = new Vector(600, 600);
export const CARD_SIZE = new Vector(72, 99);
export const ACTIVE_POSITION = new Vector(STAGE_SIZE.x / 2, STAGE_SIZE.y * 2 / 3);
export const BENCH_POSITION = new Vector(STAGE_SIZE.x / 2, STAGE_SIZE.y * 9 / 10);
export const BENCH_OFFSET = STAGE_SIZE.x / 7;

export enum Perspective {
    Favoring,
    Opposing
};

export type StageEvent = { type: string, args: any };

export class Stage {
    private handlers: Map<string, EventHandler>;
    private _state?: State;
    private readonly objects: StageObject[] = [];
    private cards: Card[] = [];
    public freeze: boolean = false;

    public get state(): State | undefined {
        return this._state;
    }

    public get element(): JQuery<HTMLElement> {
        return $("#stage");
    }

    public constructor() {
        this.handlers = new Map<string, EventHandler>();
        this.handlers.set("banner", new EventHandler_Banner(this));
        this.handlers.set("card_move", new EventHandler_CardMove(this));
        this.handlers.set("attack", new EventHandler_Attack(this));
        this.handlers.set("damage", new EventHandler_Damage(this));
        this.handlers.set("coin", new EventHandler_CoinFlip(this));
    }

    public isMe(id: number): boolean {
        return id === this.state?.self.id;
    }

    public getPlayer(id: number): any {
        if (id === this.state?.self.id) {
            return this.state.self;
        } else if (id === this.state?.opponent.id) {
            return this.state.opponent;
        }

        return null;
    }

    public addObject(object: StageObject) {
        this.objects.push(object);
    }

    public removeObject(object: StageObject) {
        this.objects.splice(this.objects.indexOf(object), 1);
    }

    public getCard(id: number): Card | undefined {
        return this.cards.find(c => c.id === id);
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
        const handler = this.handlers.get(event.type);
        if (handler) {
            handler.onEvent(event.args, callback);
        } else {
            console.error(`Attempted to process unknown event type: ${event.type}`);
        }
    }

    public draw() {
        if (this.freeze) return;

        for (const object of this.objects.filter(o => !o.persistent)) {
            object.remove();
        }
        this.cards = [];
        
        if (this.state) {
            this.drawPlayer(Perspective.Favoring, this.state.self.active, this.state.self.bench);
            this.drawPlayer(Perspective.Opposing, this.state.opponent.active, this.state.opponent.bench);
        }
    }

    private drawPlayer(perspective: Perspective, active: PokemonCardState | undefined, bench: PokemonCardState[]) {
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
