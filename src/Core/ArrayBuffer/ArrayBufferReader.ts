import type { Reader } from '../Reader';
import { UE4StringCodec } from '../UE4StringCodec';

/**
 * DataView-backed Reader that provides primitive reads and UE4 string decoding.
 * Used by Unpacker and property factories as the low-level binary source.
 */
export class ArrayBufferReader implements Reader {
    #position = 0;
    #length: number;

    public constructor(
        private readonly source: DataView,
        position?: number,
        length?: number,
    ) {
        if (typeof position === 'number') {
            this.#position = position;
        }

        this.#length = typeof length === 'number' ? length : source.byteLength;
    }

    public get length() {
        return this.#length;
    }

    public get position(): number {
        return this.#position;
    }

    public rewind(offset: number) {
        const newPosition = this.#position + offset;
        if (newPosition < 0 || newPosition > this.length) {
            throw new Error('Rewind results in invalid position');
        }
        this.#position = newPosition;
    }

    public uint32() {
        this.ensureAvailable(4, 'uint32');
        const value = this.source.getUint32(this.#position, true);
        this.#position += 4;
        return value;
    }

    public int32() {
        this.ensureAvailable(4, 'int32');
        const value = this.source.getInt32(this.#position, true);
        this.#position += 4;
        return value;
    }

    public byte() {
        this.ensureAvailable(1, 'byte');
        const value = this.source.getUint8(this.#position);
        this.#position += 1;
        return value;
    }

    public padding() {
        const padding = this.uint32();
        if (padding) {
            throw new Error(`Expected empty padding, got ${padding.toString(16).padStart(8, '0')}`);
        }
    }

    public subarray(length: number) {
        const sub = new ArrayBufferReader(this.source, this.#position, this.#position + length);
        this.#position += length;

        return sub;
    }

    public string() {
        return UE4StringCodec.read(this);
    }

    public bytes(length: number): Uint8Array {
        if (length < 0) {
            throw new Error('Attempt to read negative byte length');
        }
        this.ensureAvailable(length, 'bytes');
        const start = this.source.byteOffset + this.#position;
        const bytes = new Uint8Array(this.source.buffer, start, length);
        this.#position += length;
        return bytes;
    }

    private ensureAvailable(size: number, context: string): void {
        if (this.#position + size > this.length) {
            throw new Error(`Attempt to read beyond buffer length in ${context}. Offset: ${this.#position}, requested: ${size}, remaining: ${this.length - this.#position}`);
        }
    }
}
