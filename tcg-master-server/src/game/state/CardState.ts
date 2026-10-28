import { IToken } from "../../IToken.js";
import { LocationState } from "./LocationState.js";

export interface CardState {
    id: string;
    token: IToken;
    dbid: string;
    name: string;
    damage: number;
    poison: boolean;
    orientation: "normal" | "asleep" | "confused" | "paralyzed";
    attachments: LocationState;
};
