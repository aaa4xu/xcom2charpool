import type { Writer } from './Writer';
import { PropertyFactory } from './PropertyFactory';
import { ArrayProperty } from './Properties/ArrayProperty';
import { BoolProperty } from './Properties/BoolProperty';
import { ByteProperty } from './Properties/ByteProperty';
import { IntProperty } from './Properties/IntProperty';
import { NameProperty } from './Properties/NameProperty';
import { StrProperty } from './Properties/StrProperty';
import { StructProperty } from './Properties/StructProperty';
import { NoneProperty } from './Properties/NoneProperty';
import { CharacterPoolDataElements } from './Arrays/CharacterPoolDataElements';
import { ArrayOfStructs } from './Arrays/ArrayOfStructs';

export class Packer {
    public static types: Record<string, PropertyFactory<unknown>> = {
        [ArrayProperty.type]: ArrayProperty,
        [BoolProperty.type]: BoolProperty,
        [ByteProperty.type]: ByteProperty,
        [IntProperty.type]: IntProperty,
        [NameProperty.type]: NameProperty,
        [StrProperty.type]: StrProperty,
        [StructProperty.type]: StructProperty,
    };

    public constructor(protected readonly writer: Writer) {}

    public writeFile(data: { state: Record<string, any>; data: CharacterPoolDataElements }) {
        // Write the magic number
        this.writer.uint32(0xffffffff);

        // Write the properties
        this.writeProperties(data.state);

        // Write the 'None' property to signify the end of properties
        NoneProperty.to(this.writer);

        // Write the 'CharacterPoolDataElements' array
        // Assuming data.data.items is the array of elements
        ArrayProperty.to(this.writer, data.data.items, this);
    }

    public writeProperties(obj: Record<string, any>) {
        for (const [name, value] of Object.entries(obj)) {
            this.writeProperty(name, value);
        }
    }

    public writeProperty(name: string, property: any, isArrayElement = false) {
        // Determine property type
        let type = typeof property === 'object' && 'constructor' in property ? property.constructor.name : '';

        switch (typeof property) {
            case 'number':
                type = 'IntProperty';
                break;

            case 'string':
                type = 'StrProperty';
                break;

            case 'boolean':
                type = 'BoolProperty';
                break;

            case 'object':
                if (property instanceof ArrayOfStructs) {
                    property = property.items;
                    type = 'ArrayProperty';
                }

                if (
                    !Array.isArray(property) &&
                    !Object.values((<typeof Packer>this.constructor).types).find((t: any) => property instanceof t)
                ) {
                    type = 'StructProperty';
                }

                break;
        }

        if (type === 'Array') type = 'ArrayProperty';

        if (!type) {
            throw new Error(`Property type is missing for property with name ${name}`);
        }

        const factory = (<typeof Packer>this.constructor).types[type];
        if (!factory) {
            throw new Error(`Unknown property type ${type} with name ${name}`);
        }

        let sizePosition = 0;

        if (!isArrayElement) {
            // Write property name and padding
            this.writer.string(name);
            this.writer.padding();

            // Write property type and padding
            this.writer.string(type);
            this.writer.padding();

            // Reserve space for size
            sizePosition = this.writer.position;
            this.writer.uint32(0);
            this.writer.padding(); // Write padding after placeholder size
        }

        // Record the start position of the property data
        const dataStartPosition = this.writer.position;

        // Write the property data
        let size = factory.to(this.writer, property, this, isArrayElement);

        if (typeof size !== 'number') {
            // Calculate the size of the property data
            const dataEndPosition = this.writer.position;
            size = dataEndPosition - dataStartPosition;
        }

        if (!isArrayElement) {
            // Go back and write the actual size
            const currentPosition = this.writer.position;
            this.writer.position = sizePosition;
            this.writer.uint32(size);
            // Do not write padding again here

            // Restore the writer position to continue writing
            this.writer.position = currentPosition;
        }
    }
}
