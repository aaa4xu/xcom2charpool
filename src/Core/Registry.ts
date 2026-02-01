import { BoolProperty } from './Properties/BoolProperty';
import { PropertyFactory } from './PropertyFactory';
import { ByteProperty } from './Properties/ByteProperty';
import { IntProperty } from './Properties/IntProperty';
import { NameProperty } from './Properties/NameProperty';
import { StrProperty } from './Properties/StrProperty';
import { StructProperty } from './Properties/StructProperty';
import { ArrayProperty } from './Properties/ArrayProperty';
import { ArrayFactory } from '../Arrays/ArrayFactory';

export class Registry {
    private readonly types: Map<string, PropertyConstructor<unknown>> = new Map();
    private readonly arrays: Map<string, ArrayFactory<unknown>>;

    public constructor(options: RegistryOptions) {
        // Built-in types
        this.types.set(BoolProperty.type, BoolProperty);
        this.types.set(ByteProperty.type, ByteProperty);
        this.types.set(IntProperty.type, IntProperty);
        this.types.set(NameProperty.type, NameProperty);
        this.types.set(StrProperty.type, StrProperty);
        this.types.set(StructProperty.type, StructProperty);
        this.types.set(ArrayProperty.type, ArrayProperty);
        // Additional types
        if (options.properties) {
            for (const [k, v] of options.properties) {
                this.types.set(k, v);
            }
        }
        // Array types
        this.arrays = options.arrays ?? new Map();
    }

    public type(typeName: string): PropertyConstructor<unknown> | undefined {
        return this.types.get(typeName);
    }

    public array(arrayName: string): ArrayFactory<unknown> | undefined {
        return this.arrays.get(arrayName);
    }

    public findType(value: unknown) {
        return Array.from(this.types.values()).find((type) => value instanceof type);
    }
}

export type PropertyConstructor<T> = PropertyFactory<T> & (new (...args: any[]) => unknown);

export interface RegistryOptions {
    properties?: Map<string, PropertyConstructor<unknown>>;
    arrays?: Map<string, ArrayFactory<unknown>>;
}
