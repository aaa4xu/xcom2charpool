import type { Reader } from '../Reader';
import type { Writer } from '../Writer';

/** Enum */
export class ByteProperty {
    public static readonly type = 'ByteProperty';

    public constructor(
        public readonly type: string,
        public readonly value: string,
    ) {}

    public static from(reader: Reader, name: string, size: number) {
        const type = reader.string();
        reader.padding();

        const value = reader.string();
        reader.padding();

        return new this(type, value);
    }

    public static to(target: Writer, value: ByteProperty) {
        // Write the enum type name (not included in size)
        target.string(value.type).padding();

        // Record the start position for size calculation
        const startPosition = target.position;

        // Write the enum value name (included in size)
        target.string(value.value).padding();

        // Record the end position
        const endPosition = target.position;

        // Return the size for the size field
        return endPosition - startPosition;
    }
}
