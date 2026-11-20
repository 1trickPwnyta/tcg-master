import { pathToFileURL } from "url";
import path from "path";
import { ITargetable } from "../state/Choice.js";
import { EnergyTypeDef } from "../../defs/EnergyTypeDef.js";
import { AttackComp } from "./comps/AttackComp.js";
import { IAttackData } from "../../defs/IDefData.js";
import { DefDatabase } from "../../defs/DefDatabase.js";
import { GameEngine } from "../engine/GameEngine.js";
import { AcceptanceReport } from "../../AcceptanceReport.js";
import { EnergyCost } from "./EnergyCost.js";
import { AttackContext, AttackResult } from "./AttackContext.js";
import { Interrupt } from "../state/interrupts/Interrupt.js";
import { IToken } from "../../IToken.js";
import { parentPort } from "worker_threads";

const __dirname = import.meta.dirname;

export class Attack implements ITargetable {
    public readonly name: string;
    public readonly cost: EnergyTypeDef[];
    public readonly damage: number;
    public readonly text?: string;
    public readonly comps: AttackComp[];

    private readonly attackData: IAttackData;

    public get id(): string {
        return this.name;
    }

    public get targetName(): string {
        return `${this.name} [${this.cost.map(c => c.symbol).join("")}] ${this.damage ? this.damage : ""} ${this.comps.length ? "..." : ""}`;
    }

    public get token(): IToken {
        return { name: this.name, type: "attack" };
    }

    public constructor(data: IAttackData) {
        this.attackData = data;
        this.name = this.attackData.name;
        this.cost = this.attackData.cost.map(c => DefDatabase.get<EnergyTypeDef>(c));
        this.damage = this.attackData.damage ?? 0;
        this.text = this.attackData.text;
        this.comps = [];
    }

    public async init() {
        if (this.attackData.comps) {
            for (const compData of this.attackData.comps) {
                const compClass = typeof compData === "string" ? compData : compData.class;
                const compArgs = typeof compData !== "string" ? compData.args : [];
                const fullName = path.join(__dirname, "comps", `${compClass}.ts`);
                const module = await import(pathToFileURL(fullName).href);
                const compConstructor = module[compClass];
                const comp = new compConstructor(compArgs);
                this.comps.push(comp);
            }
        }
    }

    public canUse(engine: GameEngine): AcceptanceReport {
        let cost = [ ...this.cost ];
        const pokemon = engine.game.activePokemon;
        for (const modifier of pokemon.modifiers) {
            cost = modifier.modifier.modifyAttackCost({
                engine: engine,
                owner: pokemon.owner,
                card: pokemon
            }, this, modifier.args);
        }

        if (!EnergyCost.costSatisfied(cost, pokemon.energy)) {
            return AcceptanceReport.Rejected(`${pokemon.name} doesn't have enough energy to use ${this.name}.`);
        }
        for (const comp of this.comps) {
            const report = comp.canUse(engine);
            if (!report.accepted) {
                return report;
            }
        }

        return AcceptanceReport.Accepted;
    }

    public validateTargets(engine: GameEngine, ...targets: (number | string)[]): Interrupt | null {
        const context = new AttackContext(engine, this, this.damage, ...targets);
        for (const comp of this.comps) {
            const interrupt = comp.validateTargets(context);
            if (interrupt) {
                return interrupt;
            }
        }

        return null;
    }

    public execute(engine: GameEngine, ...targets: (number | string)[]): AttackResult | undefined {
        const pokemon = engine.game.activePokemon;
        engine.game.turn!.phase = "attack";
        engine.send(...pokemon.fullTokens, "used", this, "!");

        const context = new AttackContext(engine, this, this.damage, ...targets);
        const modifierContext = {
            engine: context.engine,
            owner: context.engine.game.activePlayer,
            card: context.attacker
        };

        for (const modifier of context.attacker.modifiers) {
            modifier.modifier.try_attack(modifierContext, context);
            if (context.failed) {
                break;
            }
        }

        if (!context.failed) {
            for (const comp of this.comps) {
                if (!context.engine.simulation) {
                    comp.apply(context);
                } else {
                    comp.applyAverage(context);
                }
                if (context.failed) {
                    break;
                }
            }
        }

        let result;
        if (!context.failed) {
            result = context.resolve();
        } else {
            engine.send(...pokemon.fullTokens, "'s attack failed.");
        }

        engine.game.turn!.phase = "postattack";
        return result;
    }

    public getDetails(): any[] {
        return [
            `[${this.cost.map(e => e.symbol).join("")}]`,
            this.name,
            this.damage || "",
            "<br />",
            this.text
        ];
    }
};
