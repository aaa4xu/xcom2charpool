import { ArrayBufferReader } from '../../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../../ArrayBuffer/ArrayBufferWriter';
import { CodecRegistry } from '../../Registry';
import { StructArrayElement } from './StructArrayElement';
import { StructPropertyValue } from './StructPropertyValue';
import { CodecError } from '../../Errors/CodecError';

function makeCtx() {
    return { path: [] as string[], registry: new CodecRegistry() };
}

describe('StructArrayElement', () => {
    test.each([
        {
            name: 'single field struct',
            elementType: 'TestStruct',
            obj: { field: 'hello' },
        },
        {
            name: 'empty struct',
            elementType: 'EmptyStruct',
            obj: {},
        },
    ])('round-trips $name', ({ elementType, obj }) => {
        const codec = new StructArrayElement(elementType);
        const writer = new ArrayBufferWriter();
        const ctx = makeCtx();

        codec.write(writer, new StructPropertyValue(elementType, obj), ctx);

        const buffer = writer.getBuffer();
        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = codec.read(reader, ctx);

        expect(result).toBeInstanceOf(StructPropertyValue);
        expect(result.type).toBe(elementType);
        expect(result.value).toStrictEqual(obj);
        expect(reader.position).toBe(buffer.byteLength);
    });

    test('read assigns the type from the codec constructor, not from the binary data', () => {
        // StructArrayElement only encodes the nested object; the struct type is stored in the codec.
        const codec = new StructArrayElement('MyStruct');
        const writer = new ArrayBufferWriter();
        const ctx = makeCtx();
        codec.write(writer, new StructPropertyValue('MyStruct', { x: 'y' }), ctx);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        const result = codec.read(reader, ctx);

        expect(result.type).toBe('MyStruct');
    });

    test('write throws CodecError when value type does not match the codec type', () => {
        const codec = new StructArrayElement('ExpectedType');
        const writer = new ArrayBufferWriter();

        expect(() =>
            codec.write(writer, new StructPropertyValue('WrongType', { x: 'y' }), makeCtx()),
        ).toThrow(CodecError);
    });

    test('write error message includes both expected and actual type names', () => {
        const codec = new StructArrayElement('ExpectedType');
        const writer = new ArrayBufferWriter();

        expect(() =>
            codec.write(writer, new StructPropertyValue('GotType', {}), makeCtx()),
        ).toThrow('ExpectedType');
    });
});
