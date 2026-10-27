import { InterruptResolution } from "../InterruptResolution.js";

export interface InterruptSync {
    id?: string;
    interrupts?: Interrupt[];
    player: string;
    prompt: string;
    choices: { text: string, target_id: string }[];
    force?: boolean;
    resolution?: InterruptResolution;
    args?: string[];
};

export interface InterruptAsync {
    id?: string;
    interrupts: Interrupt[];
    player?: string;
    prompt?: string;
    choices?: { text: string, target_id: string }[];
    force?: boolean;
};

export type Interrupt = InterruptSync | InterruptAsync;
