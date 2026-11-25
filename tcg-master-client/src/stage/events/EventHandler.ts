import type { Stage } from "../stage";

export abstract class EventHandler {
    protected stage: Stage;

    public constructor(stage: Stage) {
        this.stage = stage;
    }

    public abstract onEvent(args: any, callback: () => void): void;
};
