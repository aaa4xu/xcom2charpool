import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { CodecRegistry } from '../Registry';
import { StrProperty } from './StrProperty';

function makeCtx() {
    return { path: [] as string[], registry: new CodecRegistry() };
}

describe('StrProperty', () => {
    test.each([
        { name: 'ASCII', value: 'hello' },
        { name: 'empty', value: '' },
        { name: 'Unicode', value: 'тест' },
        { name: 'mixed ASCII and Unicode', value: 'Hello, мир!' },
    ])('round-trips $name', ({ value }) => {
        const codec = new StrProperty();
        const writer = new ArrayBufferWriter();
        codec.write(writer, value);

        const buffer = writer.getBuffer();
        const reader = new ArrayBufferReader(new DataView(buffer));
        const result = codec.read(reader, buffer.byteLength, makeCtx());

        expect(result).toBe(value);
        expect(reader.position).toBe(buffer.byteLength);
    });

    describe('isSupported', () => {
        const codec = new StrProperty();

        test('returns true for non-empty string', () => expect(codec.isSupported('hello')).toBe(true));
        test('returns true for empty string', () => expect(codec.isSupported('')).toBe(true));
        test('returns false for number', () => expect(codec.isSupported(42)).toBe(false));
        test('returns false for null', () => expect(codec.isSupported(null)).toBe(false));
        test('returns false for plain object', () => expect(codec.isSupported({})).toBe(false));
    });
});
