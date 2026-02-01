import type { Reader } from '../Reader';

/** Implementation based on browser's DataView */
export class ArrayBufferReader implements Reader {
    #position = 0;
    #length: number;

    protected static readonly ASCIIDecoder = new TextDecoder('windows-1252');
    protected static readonly utf16Decoder = new TextDecoder('utf-16le');

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
        if (this.#position + 4 > this.length) {
            throw new Error('Attempt to read beyond buffer length in uint32');
        }
        const value = this.source.getUint32(this.#position, true);
        this.#position += 4;
        return value;
    }

    public int32() {
        if (this.#position + 4 > this.length) {
            throw new Error('Attempt to read beyond buffer length in int32');
        }
        const value = this.source.getInt32(this.#position, true);
        this.#position += 4;
        return value;
    }

    public byte() {
        if (this.#position + 1 > this.length) {
            throw new Error('Attempt to read beyond buffer length in byte');
        }
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
        let length = this.int32();
        if (length === 0) return '';

        const isUTF16 = length < 0;

        // Adjust length for UTF-16 encoding
        if (isUTF16) length = length * -2;

        if (this.#position + length > this.length) {
            throw new Error('Attempt to read beyond buffer length in string');
        }

        const start = this.source.byteOffset + this.#position;
        const bytes = new Uint8Array(this.source.buffer, start, length);
        this.#position += length;

        if (bytes[bytes.length - 1] !== 0x00) {
            // Strings are expected to be null-terminated
            throw new Error(`Incorrect string size ${length}`);
        }

        const decoder = isUTF16 ? ArrayBufferReader.utf16Decoder : ArrayBufferReader.ASCIIDecoder;
        // Exclude the null terminator
        return decoder.decode(bytes.subarray(0, bytes.length - (isUTF16 ? 2 : 1)));
    }

    public bytes(length: number): Uint8Array {
        if (length < 0) {
            throw new Error('Attempt to read negative byte length');
        }
        if (this.#position + length > this.length) {
            throw new Error('Attempt to read beyond buffer length in bytes');
        }
        const start = this.source.byteOffset + this.#position;
        const bytes = new Uint8Array(this.source.buffer, start, length);
        this.#position += length;
        return bytes;
    }
}
