import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { Packer } from '../Packer';
import { Unpacker } from '../Unpacker';
import { StructProperty } from './StructProperty';
import { Registry } from '../Registry';

describe('StructProperty', () => {
    test('round-trips empty struct with type preserved', () => {
        const writer = new ArrayBufferWriter();
        const packer = new Packer(writer, new Registry());
        const original = new StructProperty('TestStruct', {});

        packer.writeProperty('TestStructProp', original);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        const unpacker = new Unpacker(reader, new Registry());
        const parsed = unpacker.property();

        expect(parsed?.name).toBe('TestStructProp');
        expect(parsed?.property).toBeInstanceOf(StructProperty);
        expect((parsed?.property as StructProperty).type).toBe('TestStruct');
        expect((parsed?.property as StructProperty).value).toStrictEqual({});
        expect(unpacker.position).toBe(unpacker.length);
    });

    test('throws when struct payload size is too small', () => {
        const writer = new ArrayBufferWriter();
        const packer = new Packer(writer, new Registry());
        const original = new StructProperty('TestStruct', {});

        packer.writeProperty('TestStructProp', original);

        const buffer = writer.getBuffer();
        const view = new DataView(buffer);
        const sizeOffset = findSizeOffset(buffer);
        const size = view.getUint32(sizeOffset, true);
        view.setUint32(sizeOffset, size - 1, true);

        const reader = new ArrayBufferReader(view);
        const unpacker = new Unpacker(reader, new Registry());
        expect(() => unpacker.property()).toThrow();
    });

    test('throws when struct payload has trailing bytes', () => {
        const writer = new ArrayBufferWriter();
        const packer = new Packer(writer, new Registry());
        const original = new StructProperty('TestStruct', {});

        packer.writeProperty('TestStructProp', original);

        const originalBuffer = writer.getBuffer();
        const extended = new ArrayBuffer(originalBuffer.byteLength + 4);
        new Uint8Array(extended).set(new Uint8Array(originalBuffer));

        const view = new DataView(extended);
        const sizeOffset = findSizeOffset(extended);
        const size = view.getUint32(sizeOffset, true);
        view.setUint32(sizeOffset, size + 4, true);

        const reader = new ArrayBufferReader(view);
        const unpacker = new Unpacker(reader, new Registry());
        expect(() => unpacker.property()).toThrow(/payload size mismatch/);
    });
});

function findSizeOffset(buffer: ArrayBuffer): number {
    const view = new DataView(buffer);
    const reader = new ArrayBufferReader(view);
    reader.string();
    reader.padding();
    reader.string();
    reader.padding();
    return reader.position;
}
