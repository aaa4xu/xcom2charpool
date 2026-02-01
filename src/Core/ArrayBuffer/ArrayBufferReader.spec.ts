import { Unpacker } from '../../Unpacker';
import { ArrayBufferReader } from './ArrayBufferReader';
import { Reader } from '../Reader';
import { binary as cases } from './__fixtures__/binary';
import { ArrayOfInt } from '../../Arrays/ArrayOfInt';
import { Registry } from '../Registry';

describe('ArrayBufferReader', () => {
    test.each(Object.entries(cases).map(([name, config]) => [name, config.name, config.value, config.bytes]))(
        'should read %s',
        (_, name, expected, bytes) => {
            const unpacker = new Unpacker(reader(bytes), new Registry({
                arrays: new Map(
                    Object.entries({
                        TestArr3: ArrayOfInt,
                    }),
                ),
            }));
            const value = unpacker.property()!;
            expect(value.name).toBe(name);
            expect(value.property).toStrictEqual(expected);
            expect(unpacker.position).toBe(unpacker.length);
        },
    );
});

function reader(buffer: number[] | Buffer): Reader {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) view[i] = buffer[i];

    return new ArrayBufferReader(new DataView(arrayBuffer));
}
