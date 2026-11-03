import { CardState } from "./CardState.js";

export interface LocationState {
    id: number;
    name: string;
    cards: CardState[];
};
