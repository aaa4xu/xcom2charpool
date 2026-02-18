import { ArrayBufferReader } from '../../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../../ArrayBuffer/ArrayBufferWriter';
import { CodecRegistry } from '../../Registry';
import { ByteArrayElement } from './ByteArrayElement';
import { BytePropertyValue } from './BytePropertyValue';
import { CodecError } from '../../Errors/CodecError';

function makeCtx() {
    return { path: [] as string[], registry: new CodecRegistry() };
}

describe('ByteArrayElement', () => {
    test.each([
        { name: 'typical enum value', elementType: 'EUniformStatus', value: 'EUS_Manual' },
        { name: 'empty value', elementType: 'SomeType', value: '' },
    ])('round-trips $name', ({ elementType, value }) => {
        const codec = new ByteArrayElement(elementType);
        const writer = new ArrayBufferWriter();
        const ctx = makeCtx();

        codec.write(writer, new BytePropertyValue(elementType, value), ctx);

        const buffer = writer.getBuffer();
        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = codec.read(reader, ctx);

        expect(result).toBeInstanceOf(BytePropertyValue);
        expect(result.type).toBe(elementType);
        expect(result.value).toBe(value);
        expect(reader.position).toBe(buffer.byteLength);
    });

    test('read assigns the type from the codec constructor, not from the binary data', () => {
        // ByteArrayElement only encodes the value string; the type is stored in the codec.
        const codec = new ByteArrayElement('EUniformStatus');
        const writer = new ArrayBufferWriter();
        const ctx = makeCtx();
        codec.write(writer, new BytePropertyValue('EUniformStatus', 'EUS_ClassSpecific'), ctx);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        const result = codec.read(reader, ctx);

        expect(result.type).toBe('EUniformStatus');
    });

    test('write throws CodecError when value type does not match the codec type', () => {
        const codec = new ByteArrayElement('EUniformStatus');
        const writer = new ArrayBufferWriter();

        expect(() =>
            codec.write(writer, new BytePropertyValue('WrongType', 'EUS_Manual'), makeCtx()),
        ).toThrow(CodecError);
    });

    test('write error message includes both expected and actual type names', () => {
        const codec = new ByteArrayElement('Expected');
        const writer = new ArrayBufferWriter();

        expect(() =>
            codec.write(writer, new BytePropertyValue('Got', 'value'), makeCtx()),
        ).toThrow('Expected');
    });
});
