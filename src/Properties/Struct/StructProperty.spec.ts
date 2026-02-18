import { ArrayBufferReader } from '../../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../../ArrayBuffer/ArrayBufferWriter';
import { CodecRegistry } from '../../Registry';
import { StructProperty } from './StructProperty';
import { StructPropertyValue } from './StructPropertyValue';

function makeCtx() {
    return { path: [] as string[], registry: new CodecRegistry() };
}

describe('StructProperty', () => {
    test.each([
        {
            name: 'single string field',
            type: 'TestStruct',
            obj: { field: 'hello' },
        },
        {
            name: 'multiple string fields',
            type: 'PersonStruct',
            obj: { firstName: 'Alice', lastName: 'Smith' },
        },
        {
            name: 'empty struct',
            type: 'EmptyStruct',
            obj: {},
        },
    ])('round-trips $name', ({ type, obj }) => {
        const codec = new StructProperty();
        const writer = new ArrayBufferWriter();
        const input = new StructPropertyValue(type, obj);
        const ctx = makeCtx();

        // write returns the payload length that read needs for readSized
        const payloadLength = codec.write(writer, input, ctx) as number;

        const buffer = writer.getBuffer();
        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = codec.read(reader, payloadLength, ctx);

        expect(result).toBeInstanceOf(StructPropertyValue);
        expect(result.type).toBe(type);
        expect(result.value).toStrictEqual(obj);
        expect(reader.position).toBe(buffer.byteLength);
    });

    test('write returns a positive number (the payload byte count)', () => {
        const codec = new StructProperty();
        const writer = new ArrayBufferWriter();
        const result = codec.write(writer, new StructPropertyValue('S', { x: 'y' }), makeCtx());

        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThan(0);
    });

    describe('isSupported', () => {
        const codec = new StructProperty();

        test('returns true for StructPropertyValue', () =>
            expect(codec.isSupported(new StructPropertyValue('T', {}))).toBe(true));
        test('returns false for plain object', () => expect(codec.isSupported({})).toBe(false));
        test('returns false for string', () => expect(codec.isSupported('string')).toBe(false));
        test('returns false for null', () => expect(codec.isSupported(null)).toBe(false));
    });
});
