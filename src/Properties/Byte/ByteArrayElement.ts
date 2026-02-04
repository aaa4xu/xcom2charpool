import { ArrayElementCodec } from '../../ArrayElementCodec';
import { BytePropertyValue } from './BytePropertyValue';
import { Reader } from '../../Reader';
import { CodecContext } from '../../CodecContext';
import { Writer } from '../../Writer';
import { BaseCodec } from '../../BaseCodec';
import { CodecError } from '../../Errors/CodecError';

export class ByteArrayElement extends BaseCodec implements ArrayElementCodec<BytePropertyValue> {
    public constructor(public readonly type: string) {
        super();
    }

    public read(reader: Reader, ctx: CodecContext): BytePropertyValue {
        const value = reader.string();
        reader.padding();

        return new BytePropertyValue(this.type, value);
    }

    public write(writer: Writer, value: BytePropertyValue, ctx: CodecContext): void {
        if (value.type !== this.type) {
            throw new CodecError(
                `Byte array element type mismatch: expected ${this.type}, got ${value.type}`,
                this.fullPath(ctx),
            );
        }

        writer.string(value.value).padding();
    }
}
