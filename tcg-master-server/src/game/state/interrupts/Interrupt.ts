import { InterruptResolution } from "./InterruptResolution.js";
import { InterruptType } from "./InterruptType.js";

export interface InterruptSync {
    id?: number;
    interrupts?: Interrupt[];
    player: number;
    type?: InterruptType;
    prompt: string;
    choices: Choice[];
    force?: boolean;
    resolution?: InterruptResolution;
    cancelResolution?: InterruptResolution;
    args?: (number | string)[];
};

export interface InterruptAsync {
    id?: number;
    interrupts: Interrupt[];
    player?: number;
    prompt?: string;
    choices?: Choice[];
    force?: boolean;
};

export type Choice = { text: string, target_id?: number | string, resolution?: InterruptResolution, args?: number[] };
export type Interrupt = InterruptSync | InterruptAsync;
