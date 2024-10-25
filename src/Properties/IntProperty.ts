import type { Reader } from '../Reader';
import type { Writer } from '../Writer';

export class IntProperty {
    public static from(reader: Reader, name: string, size: number) {
        return reader.int32();
    }

    public static to(target: Writer, value: number) {
        target.int32(value);
    }
}
