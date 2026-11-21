export interface Turn {
    number: number;
    player: number;
    energyPlayed: boolean;
    retreats: number;
    phase: "preattack" | "attack" | "postattack";
};
