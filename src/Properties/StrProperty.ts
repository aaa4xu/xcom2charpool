import type { Reader } from '../Reader';
import type { Writer } from '../Writer';

export class StrProperty {
    public static from(reader: Reader, name: string, size: number) {
        return reader.string();
    }

    public static to(target: Writer, value: string) {
        target.string(value);
    }
}
