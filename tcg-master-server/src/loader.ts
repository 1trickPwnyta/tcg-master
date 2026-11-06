import path from "path";
import { pathToFileURL  } from "url";
import fs from "fs";

const __dirname = import.meta.dirname;

const directories = [
    path.join(__dirname, "game", "state", "workers")
];

async function load(directory: string) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
        const fullName = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            load(fullName);
        } else if (entry.isFile() && entry.name.endsWith(".ts")) {
            await import(pathToFileURL(fullName).href);
        }
    }
}

for (const directory of directories) {
    await load(directory);
}
