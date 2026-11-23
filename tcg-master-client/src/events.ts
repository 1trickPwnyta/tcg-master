import type { Socket } from "socket.io-client";

const URGENT_EVENT_CODES = [ "WAIT", "INFO", "ERR", "NEW" ];

export type GameEvent = {
    code: string;
    urgent: boolean;
    payload: any;
};

export interface IEventConsumer {
    busy: boolean;
    consumeEvent(event: GameEvent): void;
}

export class EventQueue {
    private readonly consumer: IEventConsumer;
    private queue: GameEvent[];

    public constructor(consumer: IEventConsumer, socket: Socket) {
        this.consumer = consumer;
        this.queue = [];
        socket.onAny((code: string, payload: any) => this.notify_socketMessage(code, payload));
    }

    public next(): GameEvent | null {
        if (this.queue.length) {
            const next = this.queue.splice(0, 1)[0];
            return next;
        }

        return null;
    }

    private notify_socketMessage(code: string, payload: any) {
        const event = { code: code, urgent: URGENT_EVENT_CODES.includes(code), payload: payload };
        if (event.code === "ASK" || event.code === "WAIT") {
            this.queue = this.queue.filter(q => q.code !== "ASK");
        }
        if (!event.urgent && (this.queue.length || this.consumer.busy)) {
            this.queue.push(event);
        } else {
            this.consumer.consumeEvent(event);
        }
    }
};
