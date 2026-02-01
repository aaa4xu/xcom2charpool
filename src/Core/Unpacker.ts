import type { Reader } from './Reader';
import { NoneProperty } from './Properties/NoneProperty';
import { ArrayProperty } from './Properties/ArrayProperty';
import { Registry } from './Registry';

/**
 * Core deserializer for UE4-style property graphs.
 * Uses Registry to resolve property factories and builds JS objects from binary data.
 */
export class Unpacker {
    public get position() {
        return this.reader.position;
    }

    public get length() {
        return this.reader.length;
    }

    public constructor(
        protected readonly reader: Reader,
        protected readonly registry: Registry,
    ) {}

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
                return {
                    name,
                    property: factory.from(property, name, (reader: Reader) => new Unpacker(reader, this.registry)),
                };
            } else {
                return { name, property };
            }
        }

        return { name, property };
    }
}
