import { ArrayBufferReader } from '../../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../../ArrayBuffer/ArrayBufferWriter';
import { CodecRegistry } from '../../Registry';
import { ByteProperty } from './ByteProperty';
import { BytePropertyValue } from './BytePropertyValue';

function makeCtx() {
    return { path: [] as string[], registry: new CodecRegistry() };
}

describe('ByteProperty', () => {
    test.each([
        { name: 'typical enum value', type: 'EUniformStatus', value: 'EUS_Manual' },
        { name: 'another enum', type: 'EGender', value: 'EGender_Male' },
        { name: 'empty value', type: 'SomeType', value: '' },
    ])('round-trips $name', ({ type, value }) => {
        const codec = new ByteProperty();
        const writer = new ArrayBufferWriter();
        const input = new BytePropertyValue(type, value);
        const ctx = makeCtx();

        // write returns the payload length that read needs
        const payloadLength = codec.write(writer, input, ctx) as number;

        const buffer = writer.getBuffer();
        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = codec.read(reader, payloadLength, ctx);

        expect(result).toBeInstanceOf(BytePropertyValue);
        expect(result.type).toBe(type);
        expect(result.value).toBe(value);
        expect(reader.position).toBe(buffer.byteLength);
    });

    test('write returns a positive number (the payload byte count)', () => {
        const codec = new ByteProperty();
        const writer = new ArrayBufferWriter();
        const result = codec.write(writer, new BytePropertyValue('T', 'V'), makeCtx());

        expect(typeof result).toBe('number');
        expect(result).toBeGreaterThan(0);
    });

    describe('isSupported', () => {
        const codec = new ByteProperty();

        test('returns true for BytePropertyValue', () =>
            expect(codec.isSupported(new BytePropertyValue('T', 'V'))).toBe(true));
        test('returns false for string', () => expect(codec.isSupported('string')).toBe(false));
        test('returns false for null', () => expect(codec.isSupported(null)).toBe(false));
        test('returns false for plain object', () => expect(codec.isSupported({})).toBe(false));
    });
});
