import { Input } from "./input";

export type GameEvent = {
    code: string;
    payload: any;
};

export interface IEventConsumer {
    busy: boolean;
    consumeEvent(event: GameEvent): void;
}

export class EventQueue {
    private readonly consumer: IEventConsumer;
    private queue: GameEvent[];

    public constructor(consumer: IEventConsumer) {
        this.consumer = consumer;
        this.queue = [];
        Input.socket.onAny((code: string, payload: any) => this.notify_socketMessage(code, payload));
    }

    public next(): GameEvent | null {
        if (this.queue.length) {
            const next = this.queue.splice(0, 1)[0];
            return next;
        }

        return null;
    }

    private notify_socketMessage(code: string, payload: any) {
        const event = { code: code, payload: payload };
        if (event.code === "ASK") {
            this.queue = this.queue.filter(q => q.code !== "ASK");
        }
        if (this.queue.length || this.consumer.busy) {
            this.queue.push(event);
        } else {
            this.consumer.consumeEvent(event);
        }
    }
};
