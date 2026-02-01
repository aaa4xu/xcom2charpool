import type { Reader } from './Reader';
import { PropertyFactory } from './PropertyFactory';
import { NoneProperty } from './Properties/NoneProperty';
import { ArrayProperty } from './Properties/ArrayProperty';
import { BoolProperty } from './Properties/BoolProperty';
import { ByteProperty } from './Properties/ByteProperty';
import { IntProperty } from './Properties/IntProperty';
import { NameProperty } from './Properties/NameProperty';
import { StrProperty } from './Properties/StrProperty';
import { StructProperty } from './Properties/StructProperty';
import { CharacterPoolDataElements } from './Arrays/CharacterPoolDataElements';
import { ArrayFactory } from './Arrays/ArrayFactory';
import { ArrayOfStructs } from './Arrays/ArrayOfStructs';

export class Unpacker {
    public static types: Record<string, PropertyFactory<unknown>> = {
        [ArrayProperty.type]: ArrayProperty,
        [BoolProperty.type]: BoolProperty,
        [ByteProperty.type]: ByteProperty,
        [IntProperty.type]: IntProperty,
        [NameProperty.type]: NameProperty,
        [StrProperty.type]: StrProperty,
        [StructProperty.type]: StructProperty,
    };

    public static knownArrays: Record<string, ArrayFactory<unknown>> = {
        CharacterPool: ArrayOfStructs,
        ExtraDatas: ArrayOfStructs,
        AppearanceStore: ArrayOfStructs,
        CharacterPoolLoadout: ArrayOfStructs,
        UniformSettings: ArrayOfStructs,
        CosmeticOptions: ArrayOfStructs,
    };

    public get position() {
        return this.reader.position;
    }

    public get length() {
        return this.reader.length;
    }

    public constructor(protected readonly reader: Reader) {}

    public readFile() {
        const magic = this.reader.uint32();

        if (magic !== 0xffffffff) {
            throw new Error(`Incorrect file magic 0x${magic.toString(16).padStart(8, '0')}`);
        }

        const state = this.properties();

        // Почему-то внизу файла присобачен еще один массив
        const arr = ArrayProperty.from(
            this.reader,
            CharacterPoolDataElements.name,
            this.reader.length - this.reader.position,
        ) as ArrayProperty;
        const data = new CharacterPoolDataElements(arr, (reader: Reader) => new Unpacker(reader));

        if (this.reader.position < this.reader.length) {
            throw new Error(
                `Reader is not in the end of file! ${this.reader.length - this.reader.position} bytes remains`,
            );
        }

        return { state, data };
    }

    public properties() {
        const props: Record<string, any> = {};

        while (this.reader.position < this.reader.length) {
            const prop = this.property();
            if (!prop) return props;

            props[prop.name] = prop.property;
        }

        return props;
    }

    public property() {
        const name = this.reader.string();
        this.reader.padding();

        if (name === NoneProperty.PropertyName) return;

        const type = this.reader.string();
        this.reader.padding();

        const factory = (<typeof Unpacker>this.constructor).types[type];
        if (!factory) {
            throw new Error(`Unknown property type ${type} with name ${name}`);
        }

        const size = this.reader.uint32();
        this.reader.padding();

        const property = factory.from(this.reader, name, size, (reader: Reader) => new Unpacker(reader));

        if (property instanceof ArrayProperty) {
            const factory = (<typeof Unpacker>this.constructor).knownArrays[name];
            if (factory) {
                return { name, property: factory.from(property, name, (reader: Reader) => new Unpacker(reader)) };
            } else {
                console.warn(`[Unpacker] Array of unknown type ${name}`);
            }
        }

        return { name, property };
    }
}
