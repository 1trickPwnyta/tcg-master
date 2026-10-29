import { CardState } from "./CardState.js";

export interface LocationState {
    id: string;
    name: string;
    cards: CardState[];
};
