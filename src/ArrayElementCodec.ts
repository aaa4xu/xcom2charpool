import { Reader } from './Reader';
import { CodecContext } from './CodecContext';
import { Writer } from './Writer';

export interface ArrayElementCodec<T = unknown> {
    read(reader: Reader, ctx: CodecContext): T;
    write(writer: Writer, value: T, ctx: CodecContext): void;
}
