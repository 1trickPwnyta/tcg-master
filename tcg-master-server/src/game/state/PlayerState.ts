import { IToken } from "../../IToken.js";
import { LocationState } from "./LocationState.js";

export interface PlayerState {
    id: number;
    token: IToken;
    name: string;
    pronouns: {
        subjective: string;
        possessive: string;
    };
    active: LocationState;
    bench: LocationState;
    limbo: LocationState;
    hand: LocationState;
    discard: LocationState;
    prizes: LocationState;
    deck: LocationState;
    mulligans: number;
    mulliganBonusUsed: boolean;
    setupComplete: boolean;
};
