import { CardWorker } from "./workers/CardWorker.js";

const workers = new Map<string, CardWorker>();
export function Card(dbid: string) {
    return (worker: new () => CardWorker) => {
        const instance = new worker();
        instance.dbid = dbid;
        workers.set(dbid, instance);
    };
};

export class CardDatabase {
    public static find<T extends CardWorker>(dbid: string): T {
        return workers.values().find(w => w.dbid === dbid) as T;
    }

    public static search<T extends CardWorker>(query: { name?: string }): T {
        return workers.values().find(w => w.name === query.name) as T;
    }
};
