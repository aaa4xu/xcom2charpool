import { TypeCodec } from '../../TypeCodec';
import { Reader } from '../../Reader';
import { Writer } from '../../Writer';
import { BaseCodec } from '../../BaseCodec';
import { CodecContext } from '../../CodecContext';
import { CodecError } from '../../Errors/CodecError';

/**
 * Codec for UE IntProperty values.
 */
export class IntProperty extends BaseCodec implements TypeCodec<number> {
    public readonly type = 'IntProperty';

    public read(reader: Reader, length: number, ctx: CodecContext): number {
        if (length !== 4) {
            throw new CodecError(`IntProperty should have length 4, got ${length}`, this.fullPath(ctx));
        }

        return this.readSized(reader, length, ctx, (p) => p.int32());
    }

    public write(writer: Writer, value: number, ctx: CodecContext): void {
        this.assertValue(value, ctx);
        writer.int32(value);
    }

    private assertValue(value: number, ctx: CodecContext) {
        if (Number.isNaN(value) || !Number.isInteger(value)) {
            throw new CodecError('Value is not an integer', this.fullPath(ctx));
        }

        if (value < -0x80000000 || value > 0x7fffffff) {
            throw new CodecError('Value is out of range', this.fullPath(ctx));
        }
    }

    public isSupported(value: unknown): value is number {
        return typeof value === 'number';
    }
}
