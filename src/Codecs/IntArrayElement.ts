import { ArrayElementCodec } from '../ArrayElementCodec';
import { Reader } from '../Reader';
import { CodecContext } from '../CodecContext';
import { Writer } from '../Writer';

export class IntArrayElement implements ArrayElementCodec<number> {
    public read(reader: Reader, ctx: CodecContext): number {
        return reader.int32();
    }

    public write(writer: Writer, value: number, ctx: CodecContext): void {
        writer.int32(value);
    }
}
