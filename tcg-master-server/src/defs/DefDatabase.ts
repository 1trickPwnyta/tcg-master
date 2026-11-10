import path from "path";
import fs from "fs";
import { Def } from "./Def.js";
import { IDefData } from "./IDefData.js";
import { pathToFileURL } from "url";
import { init as initDefOf } from "./defof/DefOf.js";

const __dirname = import.meta.dirname;
const dataDirectory = path.join(__dirname, "..", "data");
const database = new Map<string, Def>();

const priority = [
    "EnergyTypeDef",
    "EvolutionDef"
];

async function loadDefs(directory: string, priority?: string, context?: "Defs" | string) {
    const dirName = path.basename(directory);
    if (!context && dirName === "Defs") {
        context = dirName;
    } else if (context && dirName !== "Defs" && dirName.endsWith("Defs")) {
        context = dirName.replace(/Defs$/, "Def");
    }
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
        const fullName = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            await loadDefs(fullName, priority, context);
        } else if (context && context !== "Defs" && entry.isFile() && entry.name.endsWith(".json")) {
            const data = fs.readFileSync(fullName, "utf-8");
            const obj = JSON.parse(data) as IDefData;
            const payload = Array.isArray(obj) ? obj : [ obj ];
            for (const item of payload.filter(p => !database.has(p.name))) {
                const defClass = item.class ?? context;
                if (!priority || priority === defClass) {
                    const modulePath = path.join(__dirname, `${defClass}.ts`);
                    const module = await import(pathToFileURL(modulePath).href);
                    const defConstructor = module[defClass];
                    const def = new defConstructor(defClass, item);
                    await def.init();
                    database.set(def.name, def);
                }
            }
        }
    }
}

export class DefDatabase {
    static async init() {
        for (const p of priority) {
            await loadDefs(dataDirectory, p);
        }
        await loadDefs(dataDirectory);
        initDefOf();
    }

    static get<T extends Def>(name: string): T {
        return database.get(name) as T;
    }

    static getAll<T extends Def>(defClass: string): T[] {
        return [ ...database.values().filter(v => v.defClass === defClass).map(v => v as T) ];
    }
};
