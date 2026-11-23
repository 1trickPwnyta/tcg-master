import { Def } from "../Def.js";
import { DefDatabase } from "../DefDatabase.js";

const defofs: (() => void)[] = [];
export function DefOf<T extends Def>() {
    return (defof: any) => {
        for (const key of Object.keys(defof)) {
            Object.defineProperty(defof, key, {
                get() { throw new Error("DefOf static field accessed before initialization."); }
            });
        }
        defofs.push(() => {
            for (const key of Object.keys(defof)) {
                const def = DefDatabase.get<T>(key);
                Object.defineProperty(defof, key, {
                    value: def,
                    writable: false
                });
            }
        });
    };
};

export function init() {
    for (const defof of defofs) {
        defof();
    }
};
