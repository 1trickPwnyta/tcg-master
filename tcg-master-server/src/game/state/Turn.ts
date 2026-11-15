export interface Turn {
    number: number;
    player: number;
    energyPlayed: boolean;
    phase: "preattack" | "attack" | "postattack";
};
