import { EnergyType } from "../game/EnergyType.js";

export interface IDefData {
    class: string;
    name: string;
    label: string;
};

export interface IAttackData {
    name: string;
    cost: (keyof typeof EnergyType)[];
    damage?: number;
    text?: string;
    workers?: (string | { class: string, args: any })[];
};

export interface ICardDefData_Pokemon {
    type: keyof typeof EnergyType;
    stage: "basic" | "stage1" | "stage2";
    hp: number;
    weakness: keyof typeof EnergyType | undefined;
    resistance: keyof typeof EnergyType | undefined;
    retreat: number;
    attacks: IAttackData[];
};
