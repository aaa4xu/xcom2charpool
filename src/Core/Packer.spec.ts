import { ArrayBufferWriter } from './ArrayBuffer/ArrayBufferWriter';
import { Packer } from './Packer';
import { Registry } from './Registry';

describe('Packer.writeProperty', () => {
    test('throws on null values', () => {
        const writer = new ArrayBufferWriter();
        const packer = new Packer(writer, new Registry());

        expect(() => packer.writeProperty('TestNull', null)).toThrow('Property "TestNull" is null');
    });

    test('throws on unsupported plain objects', () => {
        const writer = new ArrayBufferWriter();
        const packer = new Packer(writer, new Registry());

        expect(() => packer.writeProperty('TestObject', { foo: 1 })).toThrow(
            'Wrap structs into StructProperty.',
        );
    });
});
