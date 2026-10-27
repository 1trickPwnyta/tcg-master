import { LocationState } from "./LocationState.js";

export interface CardState {
    id: string;
    dbid: string;
    name: string;
    damage: number;
    poison: boolean;
    orientation: "normal" | "asleep" | "confused" | "paralyzed";
    attachments: LocationState;
};
