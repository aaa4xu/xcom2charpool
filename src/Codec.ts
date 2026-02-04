import type { Reader } from './Reader';
import type { Writer } from './Writer';
import { CodecContext } from './CodecContext';

export interface Codec<T> {
    read(reader: Reader, length: number, ctx: CodecContext): T;
    write(writer: Writer, value: T, ctx: CodecContext): void | number;
}
