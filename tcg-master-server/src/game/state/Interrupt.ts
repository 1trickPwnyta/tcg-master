import { InterruptResolution } from "../InterruptResolution.js";

export interface InterruptSync {
    id?: string;
    interrupts?: Interrupt[];
    player: string;
    prompt: string;
    choices: Choice[];
    force?: boolean;
    resolution?: InterruptResolution;
    cancelResolution?: InterruptResolution;
    args?: string[];
};

export interface InterruptAsync {
    id?: string;
    interrupts: Interrupt[];
    player?: string;
    prompt?: string;
    choices?: Choice[];
    force?: boolean;
};

export type Choice = { text: string, target_id?: string, resolution?: InterruptResolution, args?: string[] };
export type Interrupt = InterruptSync | InterruptAsync;
