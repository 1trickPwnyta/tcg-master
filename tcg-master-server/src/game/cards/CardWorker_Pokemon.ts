import { CardWorker } from "./CardWorker.js";

export abstract class CardWorker_Pokemon extends CardWorker {
    public abstract readonly evo: "basic" | "stage1" | "stage2";
    public abstract readonly hp: number;
};
