import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { NameProperty } from './NameProperty';
import { NamePropertyValue } from '../Values/NamePropertyValue';
import { CodecRegistry } from '../Registry';

describe('NameProperty', () => {
    test.each([
        { name: 'regular', value: 'TestName', instanceId: 0 },
        { name: 'empty string', value: '', instanceId: 1 },
        { name: 'max uint32', value: 'Edge', instanceId: 0xffffffff },
    ])('round-trips %s', ({ value, instanceId }) => {
        const codec = new NameProperty();
        const writer = new ArrayBufferWriter();
        codec.write(writer, new NamePropertyValue(value, instanceId));

        const buffer = writer.getBuffer();
        const reader = new ArrayBufferReader(new DataView(buffer));
        const parsed = codec.read(reader, reader.length, {
            path: [],
            registry: new CodecRegistry(),
        });

        expect(parsed).toBeInstanceOf(NamePropertyValue);
        expect(parsed.value).toBe(value);
        expect(parsed.instanceId).toBe(instanceId);
        expect(reader.position).toBe(buffer.byteLength);
    });
});
