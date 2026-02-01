import { Writer } from '../Writer';

/** Implementation based on browser's DataView */
export class ArrayBufferWriter implements Writer {
    public position = 0;
    #length = 0; // Actual length of data written
    #buffer: ArrayBuffer;
    #dataView: DataView;

    public constructor(initialSize = 1024) {
        this.#buffer = new ArrayBuffer(initialSize);
        this.#dataView = new DataView(this.#buffer);
    }

    /**
     * Ensures the internal buffer has enough capacity to write additional bytes.
     */
    private ensureCapacity(additionalBytes: number) {
        const requiredLength = this.position + additionalBytes;
        if (requiredLength > this.#buffer.byteLength) {
            // Need to resize buffer
            let newBufferLength = this.#buffer.byteLength * 2;
            while (newBufferLength < requiredLength) {
                newBufferLength *= 2;
            }
            const newBuffer = new ArrayBuffer(newBufferLength);
            new Uint8Array(newBuffer).set(new Uint8Array(this.#buffer));
            this.#buffer = newBuffer;
            this.#dataView = new DataView(this.#buffer);
        }
    }

    /**
     * Writes a 32-bit unsigned integer at the current position.
     */
    uint32(value: number) {
        this.ensureCapacity(4);
        this.#dataView.setUint32(this.position, value, true);
        this.position += 4;
        this.#length = Math.max(this.#length, this.position);
        return this;
    }

    /**
     * Writes a 32-bit signed integer at the current position.
     */
    int32(value: number) {
        this.ensureCapacity(4);
        this.#dataView.setInt32(this.position, value, true);
        this.position += 4;
        this.#length = Math.max(this.#length, this.position);
        return this;
    }

    /**
     * Writes a byte at the current position.
     */
    byte(value: number) {
        this.ensureCapacity(1);
        this.#dataView.setUint8(this.position, value);
        this.position += 1;
        this.#length = Math.max(this.#length, this.position);
        return this;
    }

    /**
     * Writes padding (4 zero bytes) at the current position.
     */
    padding() {
        this.uint32(0);
        return this;
    }

    /**
     * Encodes a string into a Uint8Array using UTF-16LE encoding.
     */
    private encodeUTF16LE(str: string): Uint8Array {
        const buf = new ArrayBuffer(str.length * 2);
        const bufView = new Uint16Array(buf);
        for (let i = 0; i < str.length; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return new Uint8Array(buf);
    }

    private encodeASCII(str: string): Uint8Array {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0; i < str.length; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return bufView;
    }

    /**
     * Writes a string with a length prefix and null-termination.
     * Automatically detects the encoding based on the characters used.
     * Uses UTF-8 for ASCII strings and UTF-16LE for strings with non-ASCII characters.
     */
    string(value: string) {
        if (value === '') {
            this.int32(0);
            return this;
        }

        // Detect if the string contains any non-ASCII characters
        // eslint-disable-next-line no-control-regex
        const isAscii = /^[\x00-\xFF]*$/.test(value);

        let encoded: Uint8Array;
        if (isAscii) {
            // Use UTF-8 encoding
            encoded = this.encodeASCII(value);
            // Add null terminator
            const totalLength = encoded.length + 1;
            this.int32(totalLength);
            this.ensureCapacity(totalLength);
            const targetArray = new Uint8Array(this.#buffer, this.position, totalLength);
            targetArray.set(encoded);
            targetArray[encoded.length] = 0x00; // null terminator
            this.position += totalLength;
            this.#length = Math.max(this.#length, this.position);
        } else {
            // Use UTF-16LE encoding
            encoded = this.encodeUTF16LE(value);
            // Add null terminator (two bytes)
            const totalLength = encoded.length + 2;
            const lengthPrefix = -((encoded.length + 2) / 2); // Negative length in number of 16-bit code units
            this.int32(lengthPrefix);
            this.ensureCapacity(totalLength);
            const targetArray = new Uint8Array(this.#buffer, this.position, totalLength);
            targetArray.set(encoded);
            targetArray[encoded.length] = 0x00; // null terminator (low byte)
            targetArray[encoded.length + 1] = 0x00; // null terminator (high byte)
            this.position += totalLength;
            this.#length = Math.max(this.#length, this.position);
        }

        return this;
    }

    /**
     * Retrieves the underlying buffer up to the current length of data written.
     * @returns A sliced ArrayBuffer containing the written data.
     */
    public getBuffer() {
        return this.#buffer.slice(0, this.#length);
    }

    public bytes(value: Uint8Array): Writer {
        this.ensureCapacity(value.length);
        new Uint8Array(this.#buffer, this.position, value.length).set(value);
        this.position += value.length;
        this.#length = Math.max(this.#length, this.position);
        return this;
    }
}
