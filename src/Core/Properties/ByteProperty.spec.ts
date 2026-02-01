import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { ByteProperty } from './ByteProperty';

describe('ByteProperty', () => {
    test('round-trips enum type and value', () => {
        const original = new ByteProperty('ETestEnum', 'ETE_AlwaysOn');
        const writer = new ArrayBufferWriter();

        const size = ByteProperty.to(writer, original);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        const parsed = ByteProperty.from(reader, 'TestEnum', size);

        expect(parsed).toBeInstanceOf(ByteProperty);
        expect(parsed.type).toBe(original.type);
        expect(parsed.value).toBe(original.value);
        expect(reader.position).toBe(writer.getBuffer().byteLength);
    });

    test('size excludes enum type bytes', () => {
        const value = new ByteProperty('ETestEnum', 'ETE_AlwaysOn');
        const writer = new ArrayBufferWriter();
        const size = ByteProperty.to(writer, value);

        const expectedValue = new ArrayBufferWriter();
        expectedValue.string(value.value).padding();

        const expectedType = new ArrayBufferWriter();
        expectedType.string(value.type).padding();

        expect(size).toBe(expectedValue.getBuffer().byteLength);
        expect(writer.getBuffer().byteLength).toBe(
            expectedValue.getBuffer().byteLength + expectedType.getBuffer().byteLength,
        );
    });

    test('handles empty strings', () => {
        const original = new ByteProperty('', '');
        const writer = new ArrayBufferWriter();

        const size = ByteProperty.to(writer, original);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        const parsed = ByteProperty.from(reader, 'TestEmpty', size);

        expect(parsed.type).toBe('');
        expect(parsed.value).toBe('');
    });

    test('does not consume trailing bytes', () => {
        const original = new ByteProperty('ETestEnum', 'ETE_AlwaysOn');
        const writer = new ArrayBufferWriter();

        const size = ByteProperty.to(writer, original);
        const endPosition = writer.position;
        writer.byte(0x7f);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        ByteProperty.from(reader, 'TestEnum', size);

        expect(reader.position).toBe(endPosition);
        expect(reader.byte()).toBe(0x7f);
    });

    test('throws when size is too small for payload', () => {
        const original = new ByteProperty('ETestEnum', 'ETE_AlwaysOn');
        const writer = new ArrayBufferWriter();
        const size = ByteProperty.to(writer, original);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        expect(() => ByteProperty.from(reader, 'TestEnum', size - 1)).toThrow();
    });

    test('throws when payload has trailing bytes', () => {
        const original = new ByteProperty('ETestEnum', 'ETE_AlwaysOn');
        const writer = new ArrayBufferWriter();
        const size = ByteProperty.to(writer, original);

        const originalBuffer = writer.getBuffer();
        const extended = new ArrayBuffer(originalBuffer.byteLength + 4);
        new Uint8Array(extended).set(new Uint8Array(originalBuffer));

        const reader = new ArrayBufferReader(new DataView(extended));
        expect(() => ByteProperty.from(reader, 'TestEnum', size + 4)).toThrow(/payload size mismatch/);
    });

    test('throws on non-zero padding after enum type', () => {
        const writer = new ArrayBufferWriter();
        writer.string('ETestEnum');
        writer.uint32(1);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        expect(() => ByteProperty.from(reader, 'TestEnum', 0)).toThrow(/padding/);
    });
});
