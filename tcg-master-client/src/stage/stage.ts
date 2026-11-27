import $ from "jquery";
import { Vector } from "./math";
import type { Player, State } from "./state";
import { Card, PokemonCard } from "./cards";
import { EventHandler } from "./events/EventHandler";
import { EventHandler_CardMove } from "./events/EventHandler_CardMove";
import { EventHandler_Damage } from "./events/EventHandler_Damage";
import { EventHandler_Attack } from "./events/EventHandler_Attack";
import { EventHandler_CoinFlip } from "./events/EventHandler_CoinFlip";
import { EventHandler_Banner } from "./events/EventHandler_Banner";
import { StageObject } from "./object";

export const STAGE_SIZE = new Vector(600, 600);
export const CARD_SIZE = new Vector(72, 99);
export const ACTIVE_POSITION = new Vector(STAGE_SIZE.x / 2, STAGE_SIZE.y * 2 / 3);
export const BENCH_POSITION = new Vector(STAGE_SIZE.x / 2, STAGE_SIZE.y * 9 / 10);
export const BENCH_OFFSET = STAGE_SIZE.x / 7;
export const DECK_POSITION = new Vector(STAGE_SIZE.x * 31 / 40, STAGE_SIZE.y * 7 / 11);
export const DISCARD_POSITION = new Vector(STAGE_SIZE.x * 11 / 12, STAGE_SIZE.y * 31 / 44);
export const PRIZE_POSITION = new Vector(STAGE_SIZE.x / 6, STAGE_SIZE.y * 15 / 22);

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
            this.drawPlayer(Perspective.Favoring, this.state.self);
            this.drawPlayer(Perspective.Opposing, this.state.opponent);
        }
    }

    private drawPlayer(perspective: Perspective, player: Player) {
        if (player.active) {
            const card = new PokemonCard(this, player.active);
            card.position = ACTIVE_POSITION;
            card.perspective = perspective;
            card.draw();
        }

        let benchPosition = BENCH_POSITION.translate(-(player.bench.length - 1) * BENCH_OFFSET / 2, 0);
        for (let i = 0; i < player.bench.length; i++) {
            const card = new PokemonCard(this, player.bench[i]);
            card.position = benchPosition;
            card.perspective = perspective;
            card.draw();
            benchPosition = benchPosition.translate(BENCH_OFFSET, 0);
        }

        if (player.deck) {
            const deck = new StageObject(this, "facedown");
            deck.element.css({
                width: `${CARD_SIZE.x}px`,
                height: `${CARD_SIZE.y}px`,
                boxShadow: `-${player.deck / 10}px ${player.deck / 5}px 0px #373455`
            });
            deck.position = DECK_POSITION;
            deck.perspective = perspective;
            deck.draw();

            const deckCount = new StageObject(this, "card-count");
            deckCount.element.text(`x${player.deck}`);
            deckCount.position = DECK_POSITION.translate(CARD_SIZE.x * 3 / 8, CARD_SIZE.y * 3 / 8);
            deckCount.perspective = perspective;
            deckCount.neverFlip = true;
            deckCount.draw();
        }

        if (player.discard.length) {
            const card = new Card(this, player.discard[player.discard.length - 1]);
            card.element.css({
                boxShadow: `-${player.discard.length / 10}px ${player.discard.length / 5}px 0px #555228`
            });
            card.position = DISCARD_POSITION;
            card.perspective = perspective;
            card.draw();

            const discardCount = new StageObject(this, "card-count");
            discardCount.element.text(`x${player.discard.length}`);
            discardCount.position = DISCARD_POSITION.translate(CARD_SIZE.x * 3 / 8, CARD_SIZE.y * 3 / 8);
            discardCount.perspective = perspective;
            discardCount.neverFlip = true;
            discardCount.draw();
        }

        if (player.prizes) {
            const prizePositions = this.getPrizePositions(player.prizes);
            for (let i = 0; i < prizePositions.length; i++) {
                const prize = new StageObject(this, "facedown");
                prize.element.css({
                    width: `${CARD_SIZE.x}px`,
                    height: `${CARD_SIZE.y}px`
                });
                prize.position = PRIZE_POSITION.translate(prizePositions[i].x, prizePositions[i].y);
                prize.perspective = perspective;
                prize.draw();
            }
        }
    }

    private getPrizePositions(amount: number): Vector[] {
        if (amount <= 0) return [];

        const angleStep = 2 * Math.PI / amount;
        const points = [];

        for (let i = 0; i < amount; i++) {
            const angle = i * angleStep - Math.PI / 2;
            points.push(new Vector(25 * Math.cos(angle), 25 * Math.sin(angle)));
        }

        return points;
    }
};
