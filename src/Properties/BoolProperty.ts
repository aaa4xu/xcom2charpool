import { TypeCodec } from '../TypeCodec';
import { Reader } from '../Reader';
import { Writer } from '../Writer';
import { BaseCodec } from '../BaseCodec';
import { CodecError } from '../Errors/CodecError';
import { CodecContext } from '../CodecContext';

export class BoolProperty extends BaseCodec implements TypeCodec<boolean> {
    public readonly type = 'BoolProperty';

    public read(reader: Reader, length: number, ctx: CodecContext): boolean {
        if (length !== 0) {
            throw new CodecError(`BoolProperty should have length 0, got ${length} instead`, this.fullPath(ctx));
        }

        return reader.byte() !== 0x00;
    }

    public write(writer: Writer, value: boolean): number {
        writer.byte(value ? 0x01 : 0x00);
        return 0;
    }

    public isSupported(value: unknown): value is boolean {
        return typeof value === 'boolean';
    }
}
