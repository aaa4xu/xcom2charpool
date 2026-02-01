import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { IntProperty } from './IntProperty';

describe('IntProperty', () => {
    test.each([
        { name: 'zero', value: 0 },
        { name: 'positive', value: 123456 },
        { name: 'negative', value: -123456 },
        { name: 'max int32', value: 0x7fffffff },
        { name: 'min int32', value: -0x80000000 },
        { name: 'minus one', value: -1 },
    ])('round-trips %s', ({ value }) => {
        const writer = new ArrayBufferWriter();
        IntProperty.to(writer, value);

        const buffer = writer.getBuffer();
        expect(buffer.byteLength).toBe(4);

        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = IntProperty.from(reader, 'TestInt', 4);

        expect(result).toBe(value);
        expect(reader.position).toBe(4);
    });

    test('does not consume trailing bytes', () => {
        const writer = new ArrayBufferWriter();
        writer.int32(101).int32(202);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        const first = IntProperty.from(reader, 'First', 4);
        const second = IntProperty.from(reader, 'Second', 4);

        expect(first).toBe(101);
        expect(second).toBe(202);
        expect(reader.position).toBe(8);
    });

    test('throws on insufficient bytes', () => {
        const reader = new ArrayBufferReader(new DataView(new ArrayBuffer(3)));

        expect(() => IntProperty.from(reader, 'TestInt', 4)).toThrow(/int32/);
    });
});
