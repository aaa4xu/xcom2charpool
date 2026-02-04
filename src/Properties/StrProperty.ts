import { TypeCodec } from '../TypeCodec';
import { Reader } from '../Reader';
import { Writer } from '../Writer';
import { BaseCodec } from '../BaseCodec';
import { CodecContext } from '../CodecContext';

/**
 * Codec for UE StrProperty values.
 */
export class StrProperty extends BaseCodec implements TypeCodec<string> {
    public readonly type = 'StrProperty';

    public read(reader: Reader, length: number, ctx: CodecContext): string {
        return this.readSized(reader, length, ctx, (p) => p.string());
    }

    public write(writer: Writer, value: string): void {
        writer.string(value);
    }

    public isSupported(value: unknown): value is string {
        return typeof value === 'string';
    }
}
