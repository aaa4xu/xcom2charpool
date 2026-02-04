import { TypeCodec } from './TypeCodec';
import { BoolProperty } from './Codecs/BoolProperty';
import { IntProperty } from './Codecs/IntProperty';
import { NameProperty } from './Codecs/NameProperty';
import { StrProperty } from './Codecs/StrProperty';
import { ByteProperty } from './Codecs/ByteProperty';
import { StructProperty } from './Codecs/StructProperty';
import { ArrayProperty } from './Codecs/ArrayProperty';
import { Codec } from './Codec';
import { ArrayElementCodec } from './ArrayElementCodec';

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
