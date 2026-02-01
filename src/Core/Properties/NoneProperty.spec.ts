import { ArrayBufferReader } from '../ArrayBuffer/ArrayBufferReader';
import { ArrayBufferWriter } from '../ArrayBuffer/ArrayBufferWriter';
import { NoneProperty } from './NoneProperty';
import { Registry } from '../Registry';
import { Unpacker } from '../Unpacker';

describe('NoneProperty', () => {
    test('terminates property list without consuming trailing bytes', () => {
        const writer = new ArrayBufferWriter();
        NoneProperty.to(writer);
        const noneEndPosition = writer.position;
        writer.byte(0x7f);

        const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
        const unpacker = new Unpacker(reader, new Registry());
        const props = unpacker.properties();

        expect(props).toStrictEqual({});
        expect(unpacker.position).toBe(noneEndPosition);
        expect(reader.byte()).toBe(0x7f);
    });
});
