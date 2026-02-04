import { TypeCodec } from './TypeCodec';
import { BoolProperty } from './Properties/BoolProperty';
import { IntProperty } from './Properties/Int/IntProperty';
import { NameProperty } from './Properties/Name/NameProperty';
import { StrProperty } from './Properties/StrProperty';
import { ByteProperty } from './Properties/Byte/ByteProperty';
import { StructProperty } from './Properties/Struct/StructProperty';
import { ArrayProperty } from './Properties/Array/ArrayProperty';
import { ArrayElementCodec } from './ArrayElementCodec';

/**
 * Central registry for property codecs and array element codecs used by readers/writers.
 */
export class CodecRegistry {
    private readonly types: Map<string, TypeCodec> = new Map();
    private readonly arrays: Map<string, ArrayElementCodec> = new Map();

    public constructor() {
        this.registerType(new BoolProperty());
        this.registerType(new IntProperty());
        this.registerType(new NameProperty());
        this.registerType(new StrProperty());
        this.registerType(new ByteProperty());
        this.registerType(new StructProperty());
        this.registerType(new ArrayProperty());
    }

    public registerArray(name: string, codec: ArrayElementCodec) {
        this.arrays.set(name, codec);
        return this;
    }

    public registerType(codec: TypeCodec) {
        this.types.set(codec.type, codec);
        return this;
    }

    public getArray(name: string): ArrayElementCodec<unknown> | undefined {
        return this.arrays.get(name);
    }

    public get(type: string, name: string): TypeCodec | undefined {
        return this.types.get(type);
    }

    public resolveByValue<T>(value: T): TypeCodec<T> | undefined {
        for (const type of this.types.values()) {
            if (type.isSupported(value)) {
                return type as TypeCodec<T>;
            }
        }
    }
}
