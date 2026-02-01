import type { Reader } from './Core/Reader';
import { PropertyFactory } from './Core/PropertyFactory';
import { NoneProperty } from './Core/Properties/NoneProperty';
import { ArrayProperty } from './Core/Properties/ArrayProperty';
import { BoolProperty } from './Core/Properties/BoolProperty';
import { ByteProperty } from './Core/Properties/ByteProperty';
import { IntProperty } from './Core/Properties/IntProperty';
import { NameProperty } from './Core/Properties/NameProperty';
import { StrProperty } from './Core/Properties/StrProperty';
import { StructProperty } from './Core/Properties/StructProperty';
import { CharacterPoolDataElements } from './Arrays/CharacterPoolDataElements';
import { ArrayFactory } from './Arrays/ArrayFactory';
import { ArrayOfStructs } from './Arrays/ArrayOfStructs';
import { Registry } from './Core/Registry';

export class Unpacker {
    public get position() {
        return this.reader.position;
    }

    public get length() {
        return this.reader.length;
    }

    public constructor(protected readonly reader: Reader, protected readonly registry: Registry) {

    }

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
        const data = new CharacterPoolDataElements(arr, (reader: Reader) => new Unpacker(reader, this.registry));

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

        const factory = this.registry.type(type);
        if (!factory) {
            throw new Error(`Unknown property type ${type} with name ${name}`);
        }

        const size = this.reader.uint32();
        this.reader.padding();

        const property = factory.from(this.reader, name, size, (reader: Reader) => new Unpacker(reader, this.registry));

        if (property instanceof ArrayProperty) {
            const factory = this.registry.array(name);
            if (factory) {
                return { name, property: factory.from(property, name, (reader: Reader) => new Unpacker(reader, this.registry)) };
            } else {
                return { name, property };
            }
        }

        return { name, property };
    }
}
