import { CardState } from "./CardState.js";
import { LocationState } from "./LocationState.js";

export interface PlayerState {
    id: string;
    tokenType: string;
    name: string;
    pronouns: {
        objective: string;
        possessive: string;
    };
    active: LocationState;
    bench: LocationState;
    hand: LocationState;
    discard: LocationState;
    prizes: LocationState;
    deck: LocationState;
    mulligans: number;
};
