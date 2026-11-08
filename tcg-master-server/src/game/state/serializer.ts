import { GameEngine } from "../engine/GameEngine.js";

const SERIALIZER_KEY = Symbol("state_serialization");

export const ClassRegistry = new Map<string, any>();

export function Serializable() {
    return (target: any, context: ClassDecoratorContext) => {
        context.addInitializer(() => {
            if (!ClassRegistry.has(target.name)) {
                ClassRegistry.set(target.name, target);
            }

            const fields = context.metadata![SERIALIZER_KEY] as string[] | undefined;
            if (fields) {
                target[SERIALIZER_KEY] = fields;
            }
        });
    };
}

export function Serialize() {
    return (_value: any, context: ClassFieldDecoratorContext) => {
        const key = context.name as string;
        if (!context.metadata![SERIALIZER_KEY]) {
            context.metadata![SERIALIZER_KEY] = [];
        }
        const metadata = context.metadata![SERIALIZER_KEY] as string[];
        metadata.push(key);
    };
};

export function SerializationReplace(_key: string, value: any) {
    if (value === null || typeof value !== "object") {
        return value;
    }

    const fields = value.constructor?.[SERIALIZER_KEY];

    if (fields) {
        const obj: Record<string, any> = { __type: value.constructor.name };
        for (const field of fields) {
            obj[field] = value[field];
        }
        return obj;
    } else {
        return value;
    }
};

export function SerializationHydrate(state: any, engine?: GameEngine): any {
    if (state === null || typeof state !== "object") {
        return state;
    }

    if (Array.isArray(state)) {
        return state.map(item => SerializationHydrate(item, engine));
    }
    
    if ("__type" in state) {
        const constructor = ClassRegistry.get(state.__type);
        if (!constructor) {
            throw new Error(`Couldn't hydrate type ${state.__type}.`);
        }

        const obj = Object.create(constructor.prototype);
        for (const key of Object.keys(state)) {
            if (key !== "__type") {
                obj[key] = SerializationHydrate(state[key], engine);
            }
        }

        obj.engine = engine;

        return obj;
    } else {
        const obj: Record<string, any> = {};
        for (const key of Object.keys(state)) {
            obj[key] = SerializationHydrate(state[key], engine);
        }
        return obj;
    }
};
