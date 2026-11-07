import { Def } from "../Def.js";
import { DefDatabase } from "../DefDatabase.js";

const defofs: (() => void)[] = [];
export function DefOf<T extends Def>() {
    return (defof: any) => {
        defofs.push(() => {
            for (const key of Object.keys(defof)) {
                const def = DefDatabase.get<T>(key);
                defof[key] = def;
            }
        });
    };
};

export function init() {
    for (const defof of defofs) {
        defof();
    }
};
