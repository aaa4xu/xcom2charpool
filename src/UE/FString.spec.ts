import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { FSting } from './FSting';

describe('FString', () => {
    test('writes and reads empty string', () => {
        const writer = new ArrayBufferWriter();
        FSting.write(writer, '');

        expect(toBytes(writer)).toStrictEqual(Uint8Array.from([0x00, 0x00, 0x00, 0x00]));

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        expect(FSting.read(reader)).toBe('');
    });

    test('writes and reads ANSI (8-bit) string', () => {
        const value = 'Hello world';
        const writer = new ArrayBufferWriter();
        FSting.write(writer, value);

        const expected = Uint8Array.from([
            ...int32Bytes(value.length + 1),
            ...Buffer.from(value, 'latin1'),
            FSting.NullByte,
        ]);

        expect(toBytes(writer)).toStrictEqual(expected);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        expect(FSting.read(reader)).toBe(value);
    });

    test('writes and reads UTF-16 string', () => {
        const value = 'Привет';
        const writer = new ArrayBufferWriter();
        FSting.write(writer, value);

        const expected = Uint8Array.from([
            ...int32Bytes(-(value.length + 1)),
            ...Buffer.from(value, 'utf16le'),
            FSting.NullByte,
            FSting.NullByte,
        ]);

        expect(toBytes(writer)).toStrictEqual(expected);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        expect(FSting.read(reader)).toBe(value);
    });

    test('throws on missing ANSI terminator', () => {
        const bytes = Uint8Array.from([...int32Bytes(4), 0x41, 0x42, 0x43, 0x44]);
        const reader = new ArrayBufferReader(new DataView(bytes.buffer));

        expect(() => FSting.read(reader)).toThrow(/terminator/i);
    });
});

export function int32Bytes(value: number): number[] {
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setInt32(0, value, true);
    return Array.from(new Uint8Array(buffer));
}

export function toBytes(writer: { getBuffer(): ArrayBuffer }): Uint8Array {
    return new Uint8Array(writer.getBuffer());
}
