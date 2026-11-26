import { GameEngine } from "../engine/GameEngine.js";

const SERIALIZER_KEY = Symbol("state_serialization");
const CLIENT_SERIALIZER_KEY = Symbol("client_state_serialization");
const CLIENT_SERIALIZER_PROXY_KEY = Symbol("client_state_proxy");

(Symbol as any).metadata ??= Symbol("Symbol.metadata");

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

            const clientFields = context.metadata![CLIENT_SERIALIZER_KEY] as string[] | undefined;
            if (clientFields) {
                target[CLIENT_SERIALIZER_KEY] = clientFields;
            }
        });
    };
}

export function Serialize() {
    return (_value: any, context: ClassFieldDecoratorContext) => {
        const key = context.name as string;
        if (!context.metadata![SERIALIZER_KEY]) {
            context.metadata![SERIALIZER_KEY] = [];
        } else if (!Object.prototype.hasOwnProperty.call(context.metadata, SERIALIZER_KEY)) {
            context.metadata![SERIALIZER_KEY] = [ ...(context.metadata![SERIALIZER_KEY] as string[]) ];
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

export function ClientSerialize() {
    return (_: any, context: ClassFieldDecoratorContext) => {
        const key = context.name as string;
        if (!context.metadata![CLIENT_SERIALIZER_KEY]) {
            context.metadata![CLIENT_SERIALIZER_KEY] = [];
        } else if (!Object.prototype.hasOwnProperty.call(context.metadata, CLIENT_SERIALIZER_KEY)) {
            context.metadata![CLIENT_SERIALIZER_KEY] = [ ...(context.metadata![CLIENT_SERIALIZER_KEY] as string[]) ];
        }
        const metadata = context.metadata![CLIENT_SERIALIZER_KEY] as string[];
        metadata.push(key);
    };
};

export function ClientSerializeProxy() {
    return (_: any, context: ClassMethodDecoratorContext) => {
        context.metadata![CLIENT_SERIALIZER_PROXY_KEY] = context.name;
    }
}

export function ClientSerializationReplacer(player_id: number) {
    return function ClientSerializationReplace(_: string, value: any) {
        if (value === null || typeof value !== "object") {
            return value;
        }

        const proxyName = value.constructor?.[Symbol.metadata]?.[CLIENT_SERIALIZER_PROXY_KEY];
        if (proxyName) {
            const proxyMethod = value[proxyName];
            if (typeof proxyMethod === "function") {
                const proxy = proxyMethod.call(value, player_id);
                if (proxy !== undefined) {
                    return proxy;
                }
            }
        }

        const fields = value.constructor?.[CLIENT_SERIALIZER_KEY];
        if (fields) {
            const obj: Record<string, any> = { __type: value.constructor.name };
            for (const field of fields) {
                obj[field] = value[field];
            }
            return obj;
        } else if (value.constructor.name === "Object" || Array.isArray(value)) {
            return value;
        } else {
            return null;
        }
    };
}
