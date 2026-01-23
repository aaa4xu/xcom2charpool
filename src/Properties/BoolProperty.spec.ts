import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { BoolProperty } from './BoolProperty';

describe('BoolProperty', () => {
    test.each([
        { name: 'zero byte', byte: 0x00, expected: false },
        { name: 'one byte', byte: 0x01, expected: true },
        { name: 'max byte', byte: 0xff, expected: true },
        { name: 'high bit set', byte: 0x80, expected: true },
    ])('from reads %s', ({ byte, expected }) => {
        const buffer = new ArrayBuffer(2);
        const view = new Uint8Array(buffer);
        view[0] = byte;
        view[1] = 0x7f;

        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = BoolProperty.from(reader, 'TestBool', 0);

        expect(result).toBe(expected);
        expect(reader.position).toBe(1);
        expect(reader.byte()).toBe(0x7f);
    });

    test.each([
        { name: 'true', value: true, expected: 0x01 },
        { name: 'false', value: false, expected: 0x00 },
    ])('to writes %s', ({ value, expected }) => {
        const writer = new ArrayBufferWriter();
        const size = BoolProperty.to(writer, value);

        expect(size).toBe(0);
        expect(new Uint8Array(writer.getBuffer())).toStrictEqual(Uint8Array.from([expected]));
    });

    test('throws on insufficient bytes', () => {
        const reader = new ArrayBufferReader(new DataView(new ArrayBuffer(0)));

        expect(() => BoolProperty.from(reader, 'TestBool', 0)).toThrow(/byte/);
    });
});
