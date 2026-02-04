import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { CodecRegistry } from '../Registry';
import { IntProperty } from './IntProperty';
import { CodecError } from '../Errors/CodecError';

describe('IntProperty', () => {
    test.each([
        { name: 'zero', value: 0 },
        { name: 'positive', value: 123456 },
        { name: 'negative', value: -123456 },
        { name: 'max int32', value: 0x7fffffff },
        { name: 'min int32', value: -0x80000000 },
        { name: 'minus one', value: -1 },
    ])('round-trips %s', ({ value }) => {
        const codec = new IntProperty();
        const writer = new ArrayBufferWriter();
        codec.write(writer, value, {
            path: [],
            registry: new CodecRegistry(),
        });

        const buffer = writer.getBuffer();
        expect(buffer.byteLength).toBe(4);

        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = codec.read(reader, 4, {
            path: [],
            registry: new CodecRegistry(),
        });

        expect(result).toBe(value);
        expect(reader.position).toBe(4);
    });

    test('should correctly handle ground truth data', () => {
        const codec = new IntProperty();
        const writer = new ArrayBufferWriter();
        expect(() =>
            codec.write(writer, 0x80000000, {
                path: [],
                registry: new CodecRegistry(),
            }),
        ).toThrow(CodecError);
    });

    test('throws on write with float value', () => {
        const codec = new IntProperty();
        const writer = new ArrayBufferWriter();
        expect(() =>
            codec.write(writer, 0.1, {
                path: [],
                registry: new CodecRegistry(),
            }),
        ).toThrow(CodecError);
    });
});
