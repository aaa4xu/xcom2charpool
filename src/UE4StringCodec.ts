import type { Reader } from './Reader';
import type { Writer } from './Writer';

/**
 * UE4 FString codec used by Reader/Writer implementations.
 * Length prefix is int32 including null terminator:
 * - Positive length: 8-bit bytes (low byte of UCS-2), null-terminated.
 * - Negative length: UTF-16LE code units, null-terminated.
 */
export class UE4StringCodec {
    public static readonly NullByte = 0x00;

    public static read(reader: Reader): string {
        const length = reader.int32();
        if (length === 0) return '';

        if (length > 0) {
            return UE4StringCodec.readAnsi(reader, length);
        }

        return UE4StringCodec.readUtf16(reader, length);
    }

    public static write(writer: Writer, value: string): void {
        if (value.length === 0) {
            writer.int32(0);
            return;
        }

        if (UE4StringCodec.isAnsi(value)) {
            const encoded = UE4StringCodec.encodeAnsi(value);
            writer.int32(encoded.length + 1);
            writer.bytes(encoded);
            writer.byte(UE4StringCodec.NullByte);
            return;
        } else {
            const encoded = UE4StringCodec.encodeUtf16LE(value);
            const codeUnitCount = value.length + 1; // Negative length in number of 16-bit code units + null terminator
            writer.int32(-codeUnitCount);
            writer.bytes(encoded);
            writer.byte(UE4StringCodec.NullByte).byte(UE4StringCodec.NullByte); // Two bytes null terminator for UTF-16
        }
    }

    private static readAnsi(reader: Reader, length: number): string {
        const bytes = reader.bytes(length);
        if (bytes[bytes.length - 1] !== UE4StringCodec.NullByte) {
            throw new Error('Invalid FString ANSI terminator');
        }
        return UE4StringCodec.decodeAnsi(bytes.subarray(0, bytes.length - 1));
    }

    private static readUtf16(reader: Reader, length: number): string {
        const codeUnitCount = -length;
        if (codeUnitCount < 0) {
            throw new Error('Invalid FString UTF-16 length');
        }
        const byteLength = codeUnitCount * 2;
        const bytes = reader.bytes(byteLength);
        if (bytes.length < 2) {
            throw new Error('Invalid FString UTF-16 length');
        }
        const last = bytes.length - 1;
        if (bytes[last] !== UE4StringCodec.NullByte || bytes[last - 1] !== UE4StringCodec.NullByte) {
            throw new Error('Invalid FString UTF-16 terminator');
        }
        return UE4StringCodec.decodeUtf16LE(bytes.subarray(0, bytes.length - 2));
    }

    private static isAnsi(value: string): boolean {
        for (let i = 0; i < value.length; i++) {
            if (value.charCodeAt(i) > 0xff) return false;
        }
        return true;
    }

    private static encodeAnsi(value: string): Uint8Array {
        const bytes = new Uint8Array(value.length);
        for (let i = 0; i < value.length; i++) {
            const code = value.charCodeAt(i);
            if (code > 0xff) {
                throw new Error('FString ANSI encode received non-ANSI code unit');
            }
            bytes[i] = code;
        }
        return bytes;
    }

    private static decodeAnsi(bytes: Uint8Array): string {
        if (bytes.length === 0) return '';
        const chunkSize = 0x8000;
        let result = '';
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            result += String.fromCharCode(...chunk);
        }
        return result;
    }

    private static encodeUtf16LE(value: string): Uint8Array {
        const buffer = new ArrayBuffer(value.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < value.length; i++) {
            view.setUint16(i * 2, value.charCodeAt(i), true);
        }
        return new Uint8Array(buffer);
    }

    private static decodeUtf16LE(bytes: Uint8Array): string {
        if (bytes.length === 0) return '';
        if (bytes.length % 2 !== 0) {
            throw new Error('Invalid FString UTF-16 byte length');
        }

        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        const codeUnitCount = bytes.length / 2;
        const chunkSize = 0x4000;
        let result = '';

        for (let i = 0; i < codeUnitCount; i += chunkSize) {
            const size = Math.min(chunkSize, codeUnitCount - i);
            const chunk = new Array<number>(size);
            for (let j = 0; j < size; j++) {
                chunk[j] = view.getUint16((i + j) * 2, true);
            }
            result += String.fromCharCode(...chunk);
        }

        return result;
    }
}
