import { ArrayBufferReader } from './ArrayBufferReader';
import { Reader } from '../Reader';

describe('ArrayBufferReader', () => {
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
