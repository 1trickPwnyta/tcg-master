import { CardWorker } from "./CardWorker.js";

export class CardDatabase {
    private static readonly workers: Map<string, CardWorker> = new Map<string, CardWorker>();

    public static find<T extends CardWorker>(card: (new (...args: any[]) => T) | string): T {
        if (typeof card === "string") {
            return CardDatabase.workers.values().find(w => w.dbid === card) as T;
        } else {
            const type = card as new (...args: any[]) => T;
            const key = type.name;
            if (!CardDatabase.workers.has(key)) {
                CardDatabase.workers.set(key, new type());
            }
            return CardDatabase.workers.get(key) as T;
        }
    }
};
