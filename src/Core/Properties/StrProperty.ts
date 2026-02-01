import type { Reader } from '../Reader';
import type { Writer } from '../Writer';

/**
 * UE4 StrProperty for FString values.
 * Delegates encoding/decoding to UE4StringCodec via the Reader/Writer.
 */
export class StrProperty {
    public static readonly type = 'StrProperty';

    public static from(reader: Reader, name: string, size: number) {
        return reader.string();
    }

    public static to(target: Writer, value: string) {
        target.string(value);
    }
}
