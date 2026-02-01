import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { NameProperty } from './NameProperty';

describe('NameProperty', () => {
    test.each([
        { name: 'regular', value: 'TestName', instanceId: 0 },
        { name: 'empty string', value: '', instanceId: 1 },
        { name: 'max uint32', value: 'Edge', instanceId: 0xffffffff },
    ])('round-trips %s', ({ value, instanceId }) => {
        const writer = new ArrayBufferWriter();
        NameProperty.to(writer, new NameProperty(value, instanceId));

        const buffer = writer.getBuffer();
        const reader = new ArrayBufferReader(new DataView(buffer));
        const parsed = NameProperty.from(reader, 'TestNameProperty', 0);

        expect(parsed).toBeInstanceOf(NameProperty);
        expect(parsed.value).toBe(value);
        expect(parsed.instanceId).toBe(instanceId);
        expect(reader.position).toBe(buffer.byteLength);
    });

    test('does not consume trailing bytes', () => {
        const writer = new ArrayBufferWriter();
        NameProperty.to(writer, new NameProperty('Trailing', 123));
        const endPosition = writer.position;
        writer.byte(0x7f);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        NameProperty.from(reader, 'TestNameProperty', 0);

        expect(reader.position).toBe(endPosition);
        expect(reader.byte()).toBe(0x7f);
    });

    test('throws on non-null-terminated string', () => {
        const bytes = Uint8Array.from([...int32Bytes(2), 0x41, 0x01]);
        const reader = new ArrayBufferReader(new DataView(bytes.buffer));

        expect(() => NameProperty.from(reader, 'BadName', 0)).toThrow(/Invalid FString ANSI terminator/);
    });

    test('throws on missing unk bytes', () => {
        const bytes = Uint8Array.from([...int32Bytes(2), 0x41, 0x00]);
        const reader = new ArrayBufferReader(new DataView(bytes.buffer));

        expect(() => NameProperty.from(reader, 'BadName', 0)).toThrow(/uint32/);
    });

    test('backward compatible with initial release of library', () => {
        const name = new NameProperty('TestName', 1);
        expect(name.instanceId).toBe(name.unk);
    });

    test('generate valid string representation for name with instance', () => {
        const name = new NameProperty('TestName', 1);
        expect(name.toString()).toBe('TestName_0');
    });

    test('generate valid string representation for name without instance', () => {
        const name = new NameProperty('TestName', 0);
        expect(name.toString()).toBe('TestName');
    });
});

function int32Bytes(value: number) {
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setInt32(0, value, true);
    return Array.from(new Uint8Array(buffer));
}
