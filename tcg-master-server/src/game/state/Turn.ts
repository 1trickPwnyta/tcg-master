export interface Turn {
    number: number;
    player: number;
    energyPlayed: boolean;
    retreats: number;
    cancels: number;
    phase: "preattack" | "attack" | "postattack";
};
