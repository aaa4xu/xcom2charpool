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

    describe('subarray semantics', () => {
        test('subarray.length equals the requested byte count, not an absolute end offset', () => {
            // Buffer: 8 bytes. Read 4 first, then subarray(4).
            // Bug: sub.length was returning 8 (absolute end offset = 4 + 4),
            // not 4 (the actual number of bytes in the sub-reader).
            const bufReader = reader([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
            bufReader.uint32(); // advance to position 4
            const sub = bufReader.subarray(4);
            expect(sub.length).toBe(4);
        });

        test('subarray.position starts at 0, not at the parent offset', () => {
            // Bug: sub.position was returning 4 (the absolute offset in the DataView),
            // not 0 (the relative position within the sub-reader).
            const bufReader = reader([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
            bufReader.uint32(); // advance to position 4
            const sub = bufReader.subarray(4);
            expect(sub.position).toBe(0);
        });

        test('subarray.position advances relative to sub-reader start after reads', () => {
            const bufReader = reader([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
            bufReader.uint32(); // advance to position 4
            const sub = bufReader.subarray(4);
            sub.uint32(); // consume 4 bytes inside sub-reader
            expect(sub.position).toBe(4);
            expect(sub.length).toBe(4); // length never changes
        });
    });
});

function reader(buffer: number[] | Buffer): Reader {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) view[i] = buffer[i];

    return new ArrayBufferReader(new DataView(arrayBuffer));
}
