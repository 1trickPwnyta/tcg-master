import { IToken } from "../../IToken.js";
import { LocationState } from "./LocationState.js";

export interface CardState {
    id: number;
    token: IToken;
    dbid: string;
    kind: "pokemon" | "trainer" | "energy";
    name: string;
    owner_id: number;
    damage: number;
    poison: boolean;
    orientation: "normal" | "asleep" | "confused" | "paralyzed";
    attachments: LocationState;
    damagePrevention?: number;
};
