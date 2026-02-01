import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { Packer } from '../Packer';
import { ArrayProperty } from './ArrayProperty';
import { Registry } from '../Registry';

describe('ArrayProperty', () => {
    test('from reads length and preserves trailing bytes', () => {
        const values = [1, -2, 3];
        const bytes = [values.length, ...values].flatMap((value) => int32Bytes(value)).concat(0x7f);
        const buffer = Uint8Array.from(bytes).buffer;

        const reader = new ArrayBufferReader(new DataView(buffer));
        const size = 4 + values.length * 4;
        const array = ArrayProperty.from(reader, 'TestArray', size);

        expect(array.length).toBe(values.length);
        const parsed = values.map(() => array.reader.int32());
        expect(parsed).toStrictEqual(values);
        expect(reader.position).toBe(size);
        expect(reader.byte()).toBe(0x7f);
    });

    test('from with empty array yields no element bytes', () => {
        const bytes = [...int32Bytes(0), 0x7f];
        const buffer = Uint8Array.from(bytes).buffer;

        const reader = new ArrayBufferReader(new DataView(buffer));
        const array = ArrayProperty.from(reader, 'EmptyArray', 4);

        expect(array.length).toBe(0);
        expect(array.reader.length - array.reader.position).toBe(0);
        expect(reader.position).toBe(4);
        expect(reader.byte()).toBe(0x7f);
    });

    test('from throws when size is too small', () => {
        const reader = new ArrayBufferReader(new DataView(new ArrayBuffer(0)));

        expect(() => ArrayProperty.from(reader, 'BadArray', 3)).toThrow(/size/);
    });

    test('from throws when size exceeds remaining bytes', () => {
        const bytes = Uint8Array.from(int32Bytes(0));
        const reader = new ArrayBufferReader(new DataView(bytes.buffer));

        expect(() => ArrayProperty.from(reader, 'BadArray', 8)).toThrow(/remaining/);
    });

    test('from throws on negative length', () => {
        const bytes = Uint8Array.from(int32Bytes(-1));
        const reader = new ArrayBufferReader(new DataView(bytes.buffer));

        expect(() => ArrayProperty.from(reader, 'BadArray', 4)).toThrow(/negative/);
    });

    test('to writes length and elements', () => {
        const values = [10, -20, 30];
        const writer = new ArrayBufferWriter();
        const packer = new Packer(writer, new Registry());

        ArrayProperty.to(writer, values, packer);

        const expected = Uint8Array.from([
            ...int32Bytes(values.length),
            ...values.flatMap((value) => int32Bytes(value)),
        ]);
        expect(new Uint8Array(writer.getBuffer())).toStrictEqual(expected);
    });

    test('to with empty array writes only length', () => {
        const writer = new ArrayBufferWriter();
        const packer = new Packer(writer, new Registry());

        ArrayProperty.to(writer, [], packer);

        expect(new Uint8Array(writer.getBuffer())).toStrictEqual(Uint8Array.from(int32Bytes(0)));
    });
});

function int32Bytes(value: number) {
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setInt32(0, value, true);
    return Array.from(new Uint8Array(buffer));
}
