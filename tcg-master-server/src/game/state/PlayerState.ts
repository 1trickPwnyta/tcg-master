import { IToken } from "../../IToken.js";
import { LocationState } from "./LocationState.js";

export interface PlayerState {
    id: string;
    token: IToken;
    name: string;
    pronouns: {
        subjective: string;
        possessive: string;
    };
    active: LocationState;
    bench: LocationState;
    hand: LocationState;
    discard: LocationState;
    prizes: LocationState;
    deck: LocationState;
    mulligans: number;
    mulliganBonusUsed: boolean;
    setupComplete: boolean;
};
