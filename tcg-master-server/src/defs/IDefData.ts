import { EvolutionTree } from "../game/cards/EvolutionTree.js";

export interface IDefData {
    class?: string;
    name: string;
    label?: string;
};

export interface IAttackData {
    name: string;
    cost: string[];
    damage?: number;
    text?: string;
    workers?: (string | { class: string, args: any })[];
};

export interface ICardDefData_Pokemon {
    type: string;
    stage: "basic" | "stage1" | "stage2";
    hp: number;
    weakness: string | undefined;
    resistance: string | undefined;
    retreat: number;
    attacks: IAttackData[];
};

export interface ICardDefData_Trainer {
    text: string;
    workers: (string | { class: string, args: any })[];
};

export interface ICardDefData_Energy {
    basic: boolean;
    type: string;
    amount: number;
    text?: string;
};

export interface IDefData_EnergyType {
    symbol: string;
    resolutionPriority?: number;
};

export interface IDefData_Evolution {
    next: string[];
};
