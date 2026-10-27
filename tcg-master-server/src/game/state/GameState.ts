import { Interrupt } from "./Interrupt.js";
import { PlayerState } from "./PlayerState.js";
import { Turn } from "./Turn.js";

export interface GameState {
    players: PlayerState[];
    turn: Turn | null;
    interrupt: Interrupt | null;
    rules: { prizes: number };
};
