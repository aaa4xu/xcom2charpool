import type { Reader } from '../Reader';
import type { Writer } from '../Writer';

/**
 * Represented by a single byte, 0x00 is False anything else is True
 */
export class BoolProperty {
    public static readonly type = 'BoolProperty';

    public static from(reader: Reader, name: string, size: number) {
        return reader.byte() !== 0x00;
    }

    public static to(target: Writer, value: boolean) {
        target.byte(value ? 1 : 0);
        return 0;
    }
}
