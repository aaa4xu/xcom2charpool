import { TypeCodec } from '../../TypeCodec';
import { BytePropertyValue } from './BytePropertyValue';
import { Reader } from '../../Reader';
import { CodecContext } from '../../CodecContext';
import { Writer } from '../../Writer';
import { BaseCodec } from '../../BaseCodec';

/**
 * Codec for UE ByteProperty values (stored as typed strings).
 */
export class ByteProperty extends BaseCodec implements TypeCodec<BytePropertyValue> {
    public readonly type = 'ByteProperty';

    public read(reader: Reader, length: number, ctx: CodecContext): BytePropertyValue {
        const type = reader.string();
        reader.padding();

        return this.readSized(reader, length, ctx, (payload) => {
            const value = payload.string();
            payload.padding();

            return new BytePropertyValue(type, value);
        });
    }

    public write(writer: Writer, value: BytePropertyValue, ctx: CodecContext): void | number {
        writer.string(value.type);
        writer.padding();

        // Record the start position for size calculation
        const startPosition = writer.position;
        writer.string(value.value);
        writer.padding();
        // Record the end position
        return writer.position - startPosition;
    }

    public isSupported(value: unknown): value is BytePropertyValue {
        return value instanceof BytePropertyValue;
    }
}
