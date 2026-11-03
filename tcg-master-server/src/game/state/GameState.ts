import { Interrupt } from "./Interrupt.js";
import { PlayerState } from "./PlayerState.js";
import { Turn } from "./Turn.js";

export interface GameState {
    players: PlayerState[];
    turn: Turn | null;
    interrupt: Interrupt | null;
    interruptStack: Interrupt[];
    rules: { prizes: number };
    betweenTurns: boolean;
    winner_id?: number;
    nextInterrupt_id: number;
};
