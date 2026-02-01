import { ArrayBufferReader } from './ArrayBufferReader';
import { Reader } from '../Reader';
import { binary as cases } from './__fixtures__/binary';
import { TypedArray } from '../Arrays/TypedArray';
import { IntProperty } from '../Properties/IntProperty';
import { Registry } from '../Registry';
import { Unpacker } from '../Unpacker';

describe('ArrayBufferReader', () => {
    test.each(Object.entries(cases).map(([name, config]) => [name, config.name, config.value, config.bytes]))(
        'should read %s',
        (_, name, expected, bytes) => {
            const registry = new Registry();
            registry.registerArray('TestArr3', TypedArray.of(IntProperty));

            const unpacker = new Unpacker(reader(bytes), registry);
            const value = unpacker.property()!;
            expect(value.name).toBe(name);
            if (value.property instanceof TypedArray) {
                expect(value.property.items).toStrictEqual(expected);
            } else {
                expect(value.property).toStrictEqual(expected);
            }
            expect(unpacker.position).toBe(unpacker.length);
        },
    );

    test('subarray throws on negative length', () => {
        const bufReader = reader([0x00]);
        expect(() => bufReader.subarray(-1)).toThrow('negative length');
    });

    test('subarray throws when exceeding remaining bytes', () => {
        const bufReader = reader([0x00]);
        expect(() => bufReader.subarray(2)).toThrow('subarray');
    });
});

function reader(buffer: number[] | Buffer): Reader {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) view[i] = buffer[i];

    return new ArrayBufferReader(new DataView(arrayBuffer));
}
