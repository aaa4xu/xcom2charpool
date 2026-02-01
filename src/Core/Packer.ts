import type { Writer } from './Writer';
import { Registry } from './Registry';
import { TypedArray } from './Arrays/TypedArray';
import { IntProperty } from './Properties/IntProperty';
import { StrProperty } from './Properties/StrProperty';
import { BoolProperty } from './Properties/BoolProperty';

/**
 * Core serializer for UE4-style property graphs.
 * Uses Registry to resolve property factories and writes names/types/sizes in binary form.
 */
export class Packer {
    public constructor(
        protected readonly writer: Writer,
        protected readonly registry: Registry,
    ) {}

    public writeProperties(obj: Record<string, any>) {
        for (const [name, value] of Object.entries(obj)) {
            this.writeProperty(name, value);
        }
    }

    public writeProperty(name: string, property: any, isArrayElement = false) {
        // Determine property type
        let type = typeof property === 'object' && 'constructor' in property ? property.constructor.type : '';

        switch (typeof property) {
            case 'number':
                type = IntProperty.type;
                break;

            case 'string':
                type = StrProperty.type;
                break;

            case 'boolean':
                type = BoolProperty.type;
                break;

            case 'object':
                if (property instanceof TypedArray) {
                    property = property.items;
                    type = 'ArrayProperty';
                }

                if (Array.isArray(property)) {
                    type = 'ArrayProperty';
                }

                if (!Array.isArray(property) && !this.registry.findType(property)) {
                    type = 'StructProperty';
                }

                break;
        }

        if (!type) {
            throw new Error(`Property type is missing for property with name ${name}`);
        }

        const factory = this.registry.type(type);
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
