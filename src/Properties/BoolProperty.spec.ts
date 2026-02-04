import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { BoolProperty } from './BoolProperty';
import { CodecRegistry } from '../Registry';

describe('BoolProperty', () => {
    test.each([
        { name: 'true', value: true, expected: 0x01 },
        { name: 'false', value: false, expected: 0x00 },
    ])('round-trips %s', ({ value, expected }) => {
        const codec = new BoolProperty();
        const writer = new ArrayBufferWriter();
        codec.write(writer, value);

        const buffer = writer.getBuffer();
        expect(new Uint8Array(buffer)).toStrictEqual(Uint8Array.from([expected]));

        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = codec.read(reader, 0, {
            path: [],
            registry: new CodecRegistry(),
        });
        expect(result).toBe(value);
        expect(reader.position).toBe(1);
    });

    test.each([
        { name: 'max byte', byte: 0xff, expected: true },
        { name: 'high bit set', byte: 0x80, expected: true },
    ])('from reads %s', ({ byte, expected }) => {
        const buffer = new ArrayBuffer(2);
        const view = new Uint8Array(buffer);
        view[0] = byte;
        view[1] = 0x7f;

        const codec = new BoolProperty();
        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = codec.read(reader, 0, {
            path: [],
            registry: new CodecRegistry(),
        });

        expect(result).toBe(expected);
        expect(reader.position).toBe(1);
        expect(reader.byte()).toBe(0x7f);
    });
});
