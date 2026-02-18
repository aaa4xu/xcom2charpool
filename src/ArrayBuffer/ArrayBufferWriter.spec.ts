import { ArrayBufferWriter } from './ArrayBufferWriter';
import { ArrayBufferReader } from './ArrayBufferReader';

describe('ArrayBufferWriter', () => {
    describe('uint32', () => {
        test('writes value in little-endian byte order', () => {
            const writer = new ArrayBufferWriter();
            writer.uint32(0x01020304);
            expect(new Uint8Array(writer.getBuffer())).toStrictEqual(
                new Uint8Array([0x04, 0x03, 0x02, 0x01]),
            );
        });

        test('advances position by 4', () => {
            const writer = new ArrayBufferWriter();
            writer.uint32(0);
            expect(writer.position).toBe(4);
        });

        test('writes max uint32 value correctly', () => {
            const writer = new ArrayBufferWriter();
            writer.uint32(0xffffffff);
            expect(new Uint8Array(writer.getBuffer())).toStrictEqual(
                new Uint8Array([0xff, 0xff, 0xff, 0xff]),
            );
        });

        test('is chainable', () => {
            const writer = new ArrayBufferWriter();
            writer.uint32(1).uint32(2);
            expect(writer.position).toBe(8);
        });
    });

    describe('int32', () => {
        test('writes positive value in little-endian byte order', () => {
            const writer = new ArrayBufferWriter();
            writer.int32(0x01020304);
            expect(new Uint8Array(writer.getBuffer())).toStrictEqual(
                new Uint8Array([0x04, 0x03, 0x02, 0x01]),
            );
        });

        test('writes -1 as 0xffffffff (two\'s complement)', () => {
            const writer = new ArrayBufferWriter();
            writer.int32(-1);
            expect(new Uint8Array(writer.getBuffer())).toStrictEqual(
                new Uint8Array([0xff, 0xff, 0xff, 0xff]),
            );
        });

        test('writes min int32 value correctly', () => {
            const writer = new ArrayBufferWriter();
            writer.int32(-0x80000000);
            expect(new Uint8Array(writer.getBuffer())).toStrictEqual(
                new Uint8Array([0x00, 0x00, 0x00, 0x80]),
            );
        });

        test('advances position by 4', () => {
            const writer = new ArrayBufferWriter();
            writer.int32(0);
            expect(writer.position).toBe(4);
        });
    });

    describe('byte', () => {
        test('writes the byte value', () => {
            const writer = new ArrayBufferWriter();
            writer.byte(0xab);
            expect(new Uint8Array(writer.getBuffer())).toStrictEqual(new Uint8Array([0xab]));
        });

        test('advances position by 1', () => {
            const writer = new ArrayBufferWriter();
            writer.byte(0);
            expect(writer.position).toBe(1);
        });

        test('is chainable', () => {
            const writer = new ArrayBufferWriter();
            writer.byte(1).byte(2).byte(3);
            expect(new Uint8Array(writer.getBuffer())).toStrictEqual(new Uint8Array([1, 2, 3]));
        });
    });

    describe('padding', () => {
        test('writes four zero bytes', () => {
            const writer = new ArrayBufferWriter();
            writer.padding();
            expect(new Uint8Array(writer.getBuffer())).toStrictEqual(
                new Uint8Array([0, 0, 0, 0]),
            );
        });

        test('advances position by 4', () => {
            const writer = new ArrayBufferWriter();
            writer.padding();
            expect(writer.position).toBe(4);
        });
    });

    describe('bytes', () => {
        test('writes the raw byte sequence', () => {
            const writer = new ArrayBufferWriter();
            writer.bytes(new Uint8Array([0x01, 0x02, 0x03]));
            expect(new Uint8Array(writer.getBuffer())).toStrictEqual(
                new Uint8Array([0x01, 0x02, 0x03]),
            );
        });

        test('advances position by the byte count', () => {
            const writer = new ArrayBufferWriter();
            writer.bytes(new Uint8Array(7));
            expect(writer.position).toBe(7);
        });

        test('empty Uint8Array leaves position unchanged', () => {
            const writer = new ArrayBufferWriter();
            writer.uint32(1);
            writer.bytes(new Uint8Array(0));
            expect(writer.position).toBe(4);
        });
    });

    describe('getBuffer', () => {
        test('returns an empty buffer when nothing was written', () => {
            const writer = new ArrayBufferWriter();
            expect(writer.getBuffer().byteLength).toBe(0);
        });

        test('returns only the bytes that were written, not the full allocation', () => {
            const writer = new ArrayBufferWriter(1024);
            writer.uint32(42);
            expect(writer.getBuffer().byteLength).toBe(4);
        });

        test('returns all sequentially written data', () => {
            const writer = new ArrayBufferWriter();
            writer.uint32(0x01020304);
            writer.byte(0xff);
            const buf = new Uint8Array(writer.getBuffer());
            expect(buf).toStrictEqual(new Uint8Array([0x04, 0x03, 0x02, 0x01, 0xff]));
        });
    });

    describe('withLength', () => {
        test('back-fills the length header with the byte count written by fn', () => {
            const writer = new ArrayBufferWriter();
            writer.withLength(() => {
                writer.uint32(0xdeadbeef); // 4 bytes
            });

            const buf = new DataView(writer.getBuffer());
            // first 4 bytes: length = 4
            expect(buf.getUint32(0, true)).toBe(4);
            // next 4 bytes: padding (always written by withLength)
            expect(buf.getUint32(4, true)).toBe(0);
            // payload
            expect(buf.getUint32(8, true)).toBe(0xdeadbeef);
        });

        test('uses the fn return value as the length when fn returns a number', () => {
            const writer = new ArrayBufferWriter();
            writer.withLength(() => {
                writer.uint32(0); // writes 4 bytes but declares length as 99
                return 99;
            });

            const buf = new DataView(writer.getBuffer());
            expect(buf.getUint32(0, true)).toBe(99);
        });

        test('position ends past all written data after fn completes', () => {
            const writer = new ArrayBufferWriter();
            writer.withLength(() => {
                writer.uint32(1); // 4 bytes
                writer.uint32(2); // 4 bytes
            });

            // 4 (length) + 4 (padding) + 4 + 4 (payload)
            expect(writer.position).toBe(16);
            expect(writer.getBuffer().byteLength).toBe(16);
        });

        test('nested withLength calls compute lengths independently', () => {
            const writer = new ArrayBufferWriter();
            writer.withLength(() => {
                writer.uint32(1); // 4 bytes inner payload
                writer.withLength(() => {
                    writer.uint32(2); // 4 bytes inner payload
                });
            });

            const buf = new DataView(writer.getBuffer());
            // outer length: uint32(1) + withLength header (8) + uint32(2) payload (4) = 16
            expect(buf.getUint32(0, true)).toBe(16);
            // inner length: uint32(2) = 4
            const innerLengthOffset = 8 + 4; // outer header (8) + outer uint32(1) (4)
            expect(buf.getUint32(innerLengthOffset, true)).toBe(4);
        });

        test('returns the fn return value', () => {
            const writer = new ArrayBufferWriter();
            const result = writer.withLength(() => 42);
            expect(result).toBe(42);
        });

        test('returns undefined when fn returns void', () => {
            const writer = new ArrayBufferWriter();
            const result = writer.withLength(() => {});
            expect(result).toBeUndefined();
        });
    });

    describe('buffer growth', () => {
        test('grows the buffer when writing exceeds initial capacity', () => {
            const writer = new ArrayBufferWriter(4); // tiny initial size
            writer.uint32(0x11111111); // fills initial 4 bytes
            writer.uint32(0x22222222); // triggers growth

            const buf = new DataView(writer.getBuffer());
            expect(buf.getUint32(0, true)).toBe(0x11111111);
            expect(buf.getUint32(4, true)).toBe(0x22222222);
        });

        test('preserves all previously written data after growth', () => {
            const writer = new ArrayBufferWriter(8);
            for (let i = 0; i < 4; i++) {
                writer.uint32(i); // forces multiple growth cycles
            }

            const buf = new DataView(writer.getBuffer());
            for (let i = 0; i < 4; i++) {
                expect(buf.getUint32(i * 4, true)).toBe(i);
            }
        });

        test('can write to a writer with initial size of 1', () => {
            const writer = new ArrayBufferWriter(1);
            writer.uint32(0xdeadbeef);

            const buf = new DataView(writer.getBuffer());
            expect(buf.getUint32(0, true)).toBe(0xdeadbeef);
        });
    });

    describe('round-trip with ArrayBufferReader', () => {
        test('data written can be read back correctly', () => {
            const writer = new ArrayBufferWriter();
            writer.uint32(0xdeadbeef);
            writer.int32(-42);
            writer.byte(0x7f);
            writer.bytes(new Uint8Array([1, 2, 3]));
            writer.padding();

            const reader = new ArrayBufferReader(new DataView(writer.getBuffer()));
            expect(reader.uint32()).toBe(0xdeadbeef);
            expect(reader.int32()).toBe(-42);
            expect(reader.byte()).toBe(0x7f);
            expect(reader.bytes(3)).toStrictEqual(new Uint8Array([1, 2, 3]));
            reader.padding(); // should not throw
            expect(reader.position).toBe(reader.length);
        });
    });
});
