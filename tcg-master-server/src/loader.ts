import path from "path";
import { pathToFileURL  } from "url";
import fs from "fs";

const __dirname = import.meta.dirname;

const directories = [
     path.join(__dirname, "game", "state", "workers")
];

for (const directory of directories) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (file.endsWith(".ts")) {
            console.log(`Loading ${file} from ${directory}.`);
            import(pathToFileURL(path.join(directory, file)).href);
        }
    }
}
