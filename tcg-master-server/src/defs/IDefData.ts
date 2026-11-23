export interface IDefData {
    class?: string;
    name: string;
    label?: string;
};

export interface IPokemonPowerData {
    name: string;
    text: string;
    workers: (string | { class: string, args: any })[];
    modifiers: (string | { class: string, args: any })[];
};

export interface IAttackData {
    name: string;
    cost: string[];
    damage?: number;
    damageLabel?: string;
    text?: string;
    comps?: (string | { class: string, args: any })[];
};

export type ICardDefData = IDefData & {
    expansion: string;
    cardNumber: number;
    modifiers?: (string | { class: string, args: any })[];
};

export type ICardDefData_Pokemon = ICardDefData & {
    type: string;
    stage: "basic" | "stage1" | "stage2";
    hp: number;
    weakness?: string;
    resistance?: string ;
    retreat: number;
    power?: IPokemonPowerData;
    attacks: IAttackData[];
    prizes?: number;
};

export type ICardDefData_Trainer = ICardDefData & {
    text: string;
    workers: (string | { class: string, args: any })[];
    preannounce?: boolean;
    wrapper?: string;
};

export type ICardDefData_Energy = ICardDefData & {
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

export interface IDefData_Effect {
    worker: string | { class: string, args: any };
};

export interface IDefData_Status {
    modifier: string | { class: string, args: any };
    orientation?: "paralyzed" | "asleep" | "confused" | "normal";
    canAttack?: boolean;
    canRetreat?: boolean;
    permanent?: boolean;
}