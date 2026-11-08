import { IToken } from "../../IToken.js";
import { LocationState } from "./LocationState.js";

export interface CardState {
    id: number;
    token: IToken;
    def: string;
    kind: "pokemon" | "trainer" | "energy";
    name: string;
    owner_id: number;
    damage: number;
    orientation: "normal" | "asleep" | "confused" | "paralyzed";
    attachments: LocationState;
    damagePrevention?: number;
    damageThreshold?: number;
    accuracyChecks?: number;
    status: string[];
};

export enum CardStatus {
    GastlyDestinyBond
};
