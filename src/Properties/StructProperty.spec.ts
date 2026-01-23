import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { Packer } from '../Packer';
import { Unpacker } from '../Unpacker';
import { StructProperty } from './StructProperty';

describe('StructProperty', () => {
    test('round-trips empty struct with type preserved', () => {
        const writer = new ArrayBufferWriter();
        const packer = new Packer(writer);
        const original = new StructProperty('TestStruct', {});

        packer.writeProperty('TestStructProp', original);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        const unpacker = new Unpacker(reader);
        const parsed = unpacker.property();

        expect(parsed?.name).toBe('TestStructProp');
        expect(parsed?.property).toBeInstanceOf(StructProperty);
        expect((parsed?.property as StructProperty).type).toBe('TestStruct');
        expect((parsed?.property as StructProperty).value).toStrictEqual({});
        expect(unpacker.position).toBe(unpacker.length);
    });
});
