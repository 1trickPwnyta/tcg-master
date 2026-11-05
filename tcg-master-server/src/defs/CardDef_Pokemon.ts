import { EnergyType } from "../game/EnergyType.js";
import { IAttackData, ICardDefData_Pokemon, IDefData } from "./IDefData.js";
import { AttackWorker } from "../game/attacks/AttackWorker.js";
import { pathToFileURL } from "url";
import path from "path";
import { CardDef } from "./CardDef.js";
import { IToken } from "../IToken.js";

const __dirname = import.meta.dirname;

export class CardDef_Pokemon extends CardDef {
    public override readonly name: string;
    public override readonly label: string;
    public override readonly kind = "pokemon";
    public readonly type: EnergyType;
    public readonly stage: "basic" | "stage1" | "stage2";
    public readonly hp: number;
    public readonly weakness: EnergyType | undefined;
    public readonly resistance: EnergyType | undefined;
    public readonly retreat: number;
    public readonly attacks: Attack[];

    private readonly cardData: IDefData & ICardDefData_Pokemon;

    public get token(): IToken {
        return { name: this.label, type: "pokemon" };
    }

    public constructor(data: IDefData) {
        super();
        this.cardData = data as IDefData & ICardDefData_Pokemon;
        this.name = this.cardData.name;
        this.label = this.cardData.label;
        this.type = EnergyType[this.cardData.type];
        this.stage = this.cardData.stage;
        this.hp = this.cardData.hp;
        this.weakness = this.cardData.weakness ? EnergyType[this.cardData.weakness] : undefined;
        this.resistance = this.cardData.resistance ? EnergyType[this.cardData.resistance] : undefined;
        this.retreat = this.cardData.retreat;
        this.attacks = [];
    }

    public override async init() {
        for (const attackData of this.cardData.attacks) {
            const attack = new Attack(attackData);
            await attack.init();
            this.attacks.push(attack);
        }
    }
};

export class Attack {
    public readonly name: string;
    public readonly cost: EnergyType[];
    public readonly damage: number;
    public readonly text?: string;
    public readonly workers: AttackWorker[];

    private readonly attackData: IAttackData;

    public constructor(data: IAttackData) {
        this.attackData = data;
        this.name = this.attackData.name;
        this.cost = this.attackData.cost.map(c => EnergyType[c]);
        this.damage = this.attackData.damage ?? 0;
        this.text = this.attackData.text;
        this.workers = [];
    }

    public async init() {
        if (this.attackData.workers) {
            for (const workerData of this.attackData.workers) {
                const workerClass = typeof workerData === "string" ? workerData : workerData.class;
                const workerArgs = typeof workerData !== "string" ? workerData.args : [];
                const fullName = path.join(__dirname, "..", "game", "attacks", `${workerClass}.ts`);
                const module = await import(pathToFileURL(fullName).href);
                const workerConstructor = module[workerClass];
                const worker = new workerConstructor(workerArgs);
                this.workers.push(worker);
            }
        }
    }
};
