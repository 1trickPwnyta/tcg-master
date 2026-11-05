import path from "path";
import fs from "fs";
import { Def } from "./Def.js";
import { IDefData } from "./IDefData.js";
import { pathToFileURL } from "url";

const __dirname = import.meta.dirname;
const dataDirectory = path.join(__dirname, "..", "data");
const database = new Map<string, Def>();

async function loadDefs(directory: string, context?: "Defs" | string) {
    const dirName = path.basename(directory);
    if (!context && dirName === "Defs") {
        context = dirName;
    }
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
        const fullName = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            await loadDefs(fullName, context);
        } else if (context && entry.isFile() && entry.name.endsWith(".json")) {
            const data = fs.readFileSync(fullName, "utf-8");
            const obj = JSON.parse(data) as IDefData;
            const modulePath = path.join(__dirname, `${obj.class}.ts`);
            const module = await import(pathToFileURL(modulePath).href);
            const defConstructor = module[obj.class];
            const def = new defConstructor(obj);
            await def.init();
            database.set(def.name, def);
        }
    }
}

await loadDefs(dataDirectory);

export class DefDatabase {
    static get<T extends Def>(name: string): T | undefined {
        return database.get(name) as T | undefined;
    }
};
